var express = require('express');
var router = express.Router();
const connectToDatabase = require('../config/db');
const ObjectId = require('mongodb').ObjectId;
/* GET home page. */
router.get('/GetGoods/:index',  async function(req, res, next) {
  const index = req.params.index
  const categoryMap = {
    0: 'books',
    1: 'drink',
    2: 'life',
  };
  console.log(index);
  const kind = categoryMap[index];
  try {
    // 连接到数据库
    const db = await connectToDatabase();
    
    // 从数据库的goods集合中查找所有商品
      const goods = await db.collection('goods').find({kind}).toArray();
      // 将查询到的商品数据作为JSON响应返回给客户端
      res.status(200).json(goods);
   
  } catch (error) {
    // 如果发生错误，向客户端发送错误信息
    console.error('Error fetching goods from database:', error);
    res.status(500).json({ error: 'An error occurred while fetching goods.' });
  }
});

//获取某一个商品数据
router.get('/GetGood/:id',  async function(req, res, next) {
  const id = req.params.id
  let objectId = new ObjectId(id);
  try {
    // 连接到数据库
    const db = await connectToDatabase();
    // 从数据库的goods集合中查找所有商品
      const goods = await db.collection('goods').find({_id:objectId}).toArray();
      // 将查询到的商品数据作为JSON响应返回给客户端
      res.status(200).json(goods);
   
  } catch (error) {
    // 如果发生错误，向客户端发送错误信息
    console.error('Error fetching goods from database:', error);
    res.status(500).json({ error: 'An error occurred while fetching goods.' });
  }
})


module.exports = router;
