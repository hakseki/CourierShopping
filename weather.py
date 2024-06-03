from flask import Flask, request, jsonify
import requests
import ssl
import redis
from pymongo import MongoClient
import uuid
from bson import ObjectId
app = Flask(__name__)

userid = 0
# Redis连接
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# MongoDB连接（请根据实际情况修改连接字符串）
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['courier']
users_collection = db['users']
# 选择集合（即表），这里假设地址信息存储在'address'集合中
addresses_collection = db['address']


def validate_user_credentials(username, password):
    """验证用户凭据是否有效。此处简化处理，实际应用中应对密码进行哈希处理。"""
    user = users_collection.find_one({"username": username, "password": password})
    return user is not None

def get_wechat_openid(code):
    """使用code获取微信openid。"""
    appid = 'wxc40e7716254e8843'
    secret = '74c1705616535ec3d454b0ad8633af50'
    query_url = f'https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={code}&grant_type=authorization_code'
    response = requests.get(query_url)
    data = response.json()
    if 'errcode' in data:
        raise Exception(f"WeChat API Error: {data['errmsg']}")
    return data.get('openid')

# 获取天气
@app.route('/weather', methods=['GET'])
def get_weather():
    # 请替换为你的AppCode
    appcode = '81bce29e134a43889a87ded74b8a8bd6'
    lng = request.args.get('lng', default=116.404844, type=float)
    lat = request.args.get('lat', default=39.915599, type=float)
    
    url = f'https://iweather.market.alicloudapi.com/gps?needday=1&lng={lng}&lat={lat}&from=gps'
    
    headers = {
        'Authorization': f'APPCODE {appcode}'
    }
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        response = requests.get(url, headers=headers, verify=False)
        response.raise_for_status()  # 检查请求是否成功
        content = response.text
        return content
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

#获取快递
@app.route('/getCourier', methods=['GET'])

def get_courier():
    host = 'https://wuliu.market.alicloudapi.com'
    path = '/kdi'
    method = 'GET'
    appcode = '81bce29e134a43889a87ded74b8a8bd6'  # 请使用你的AppCode替换这里
    # 动态获取no参数，如果没有提供则使用默认值
    no = request.args.get('no', 'SF1533868870628:9255')
    querys = f'no={no}'
    bodys = {}
    url = host + path + '?' + querys
    header = {"Authorization": 'APPCODE ' + appcode}

    try:
        res = requests.get(url, headers=header)
    except requests.RequestException as e:
        print("请求错误:", e)
        return "URL错误", 500  # 返回HTTP 500错误给客户端

    httpStatusCode = res.status_code

    if httpStatusCode == 200:
        print("正常请求计费(其他均不计费)")
        return res.text  # 直接返回响应文本
    else:
        httpReason = res.headers.get('X-Ca-Error-Message', '未知错误')
        errorMsg = {
            400: "参数错误",
            403: {
                'Unauthorized': "服务未被授权（或URL和Path不正确）",
                'Quota Exhausted': "套餐包次数用完",
                'Api Market Subscription quota exhausted': "套餐包次数用完，请续购套餐"
            },
            500: "API网关错误"
        }
        message = errorMsg.get(httpStatusCode, {}).get(httpReason, f"其他错误: {httpStatusCode}")
        print(message)
        return message, httpStatusCode  # 返回错误信息及相应的HTTP状态码

#登录login 
@app.route('/login', methods=['POST'])
def login():
    global userid
    username = request.json.get('username')
    password = request.json.get('password')
    code = request.json.get('code')
    userid = username
    openid = get_wechat_openid(code)
        # 从Redis中查询OpenID对应的token
    token = redis_client.get(openid)
    if token:
            # 如果存在，则直接返回token
            if not validate_user_credentials(username, password):
                print(username, password)
                return jsonify({"error": "Invalid username or password"}), 401
            return jsonify({"token": token.decode(), "openid": openid}), 200
    
    try:
            
     # 如果Redis中没有，尝试从MongoDB中查找用户
        user = users_collection.find_one({"openId": openid})
        if user:
            # 如果用户存在，生成并存储新token到Redis，并返回
            token = generate_token()
            redis_client.set(openid)
            return jsonify({"openid": openid}), 200
        # 如果数据库中也没有此OpenID，执行插入操作
        new_user = {
            "openId": openid,
            "username": username,
            "password": password,  # 实际生产环境中密码应该加密存储
            "phone": "",          # 示例字段，可根据实际需求填充
            "avatar": ""         # 示例字段，可根据实际需求填充
        }
        users_collection.insert_one(new_user)
        token = generate_token()
        redis_client.set(openid, token)
        return jsonify({"token": token, "openid": openid}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def generate_token():
    """生成一个示例token，实际应用中应使用更安全的方法"""
    return str(uuid.uuid4())

#添加地址
@app.route('/AddAddress', methods=['POST'])
def add_address():
    # 获取请求中的JSON数据
    data = request.get_json()
    
    # 确保所需字段存在
    required_fields = ['name', 'phone', 'province', 'city', 'district', 'detail_address']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "缺少必要的字段"}), 400
    
    # 准备要插入的数据
    new_address = {
        "user_id": userid,
        "name": data['name'],
        "phone": data['phone'],
        "province": data['province'],
        "city": data['city'],
        "district": data['district'],
        "detail_address": data['detail_address']
    }
    
    # 尝试插入数据
    try:
        result = addresses_collection.insert_one(new_address)
        return jsonify({"message": "新地址已成功添加", "document_id": str(result.inserted_id)}), 201
    except Exception as e:
        # 如果插入失败，记录错误并返回错误信息
        app.logger.error(f"Error inserting address: {e}")
        return jsonify({"error": "添加地址时发生错误"}), 500

#查询地址
@app.route('/getUserAddresses', methods=['GET'])
def get_user_addresses():
    # 使用全局变量userid来查询地址
    if userid is None:
        return jsonify({"error": "用户未登录"}), 401  # 如果userid未设置，表示用户未登录
    
    try:
        # 查询当前登录用户的所有地址信息
        addresses = addresses_collection.find({"user_id": userid})
        
        # 将ObjectId转换为字符串，并构造新的地址信息列表
        address_list = [
            {k: (str(v) if k == '_id' else v) for k, v in address.items()}
            for address in addresses
        ]
        
        return jsonify(address_list), 200
    except Exception as e:
        # 记录并返回查询错误
        app.logger.error(f"Error fetching addresses: {e}")
        return jsonify({"error": "查询地址时发生错误"}), 500

#更新地址

@app.route('/updateAddressById', methods=['PUT'])
def update_address_by_id():
    try:
        # 获取请求中的JSON数据
        data = request.get_json()
        
        # 确保_id存在
        if '_id' not in data:
            return jsonify({"error": "缺少'_id'参数"}), 400
        
        # 将字符串形式的_id转换为ObjectId
        _id = ObjectId(data['_id'])
        # 删除_id，因为我们不希望它成为更新的一部分
        del data['_id']
        
        # 执行更新操作
        result = addresses_collection.update_one({"_id": _id}, {"$set": data})
        
        if result.modified_count > 0:
            return jsonify({"message": "地址信息已成功更新"}), 200
        else:
            return jsonify({"message": "没有找到匹配的地址进行更新"}), 404
    except Exception as e:
        # 记录并返回错误
        app.logger.error(f"Error updating address: {e}")
        return jsonify({"error": "更新地址时发生错误"}), 500

#删除地址
@app.route('/deleteAddressById/<string:_id>', methods=['DELETE'])
def delete_address_by_id(_id):
    try:
        # 将字符串形式的_id转换为ObjectId
        obj_id = ObjectId(_id)
        
        # 执行删除操作
        result = addresses_collection.delete_one({"_id": obj_id})
        
        if result.deleted_count > 0:
            return jsonify({"message": "地址记录已成功删除"}), 200
        else:
            return jsonify({"message": "没有找到匹配的地址记录进行删除"}), 404
    except Exception as e:
        # 记录并返回错误
        app.logger.error(f"Error deleting address: {e}")
        return jsonify({"error": "删除地址时发生错误"}), 500    

if __name__ == '__main__':
    app.run(debug=True)