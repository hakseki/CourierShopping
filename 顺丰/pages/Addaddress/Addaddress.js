// pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ['黑龙江省', '哈尔滨市', '呼兰区'],
    name: '李田所',
    phone:114514,
    province:'东京',
    city:'下北泽',
    district: '野兽株式会社',
    detail_address: '下北泽野兽株式会社',
    users:[],
    isUpdate:false,
    updateId:``
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  ButtonAdd(){
    if(this.data.isUpdate){
      const updatedData = {
        name: this.data.name,
        phone:this.data.phone,
        province:this.data.region[0],
        city:this.data.region[1],
        district: this.data.region[2],
        detail_address: this.data.detail_address,
          };
      this.updateAddress(this.data.updateId,updatedData)
      this.setData({
        isUpdate:false
      })
    }
    else{
      this.AddAddress(this.data.name,this.data.phone,this.data.region[0],this.data.region[1],this.data.region[2],this.data.detail_address)
    }
    wx.navigateTo({
      url: '/pages/Address/Address', // 跳转的目标页面路径
    })
  },
  AddAddress(name,phone,province,city,district,detail_address){
    wx.request({
      method:'POST',
      url: 'http://127.0.0.1:5000//AddAddress', //仅为示例，并非真实的接口地址
      data: {
        name,
        phone,
        province,
        city,
        district,
        detail_address
      },
      header: {
        'content-type': 'application/json'
      },
      success (res) {
        console.log(res.data)
      }
    })
  }
  ,
  onLoad: function(options) {
    // options 参数包含了从上个页面传递过来的所有参数
    const id = options.id;
    console.log('Received id:', id); // 输出: Received id: 123
    if(id){
    this.setData({
      isUpdate:true,
      updateId:id
    })
    //将数据显示
    wx.request({
      url: 'http://127.0.0.1:5000/getUserAddresses', //仅为示例，并
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res)=>{
        const item = res.data.find(element => element._id === id)
        console.log(item);
        this.setData({
          region: [item.province,item.city,item.district],
          name: item.name,
          phone:item.phone,
          province:item.province,
          city:item.district,
          district: item.city,
          detail_address: item.detail_address,
        })
      }
    })
    
  }
  },
  updateAddress(id, updatedData) {
    wx.request({
      url: 'http://127.0.0.1:5000/updateAddressById', // 请确保与后端路由对应
      method: 'PUT',
      data: {
        _id: id,
        ...updatedData, // 这里是你要更新的字段和新值，例如{name: '新名字', phone: '新电话'}
      },
      header: {
        'content-type': 'application/json'
      },
      success (res) {
        console.log(res.data);
        if (res.statusCode === 200) {
          wx.showToast({
            title: '地址更新成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: '更新失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail(err) {
        console.error('请求失败', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },   
})