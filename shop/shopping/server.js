const express = require('express');
const connectToDatabase = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// 异步初始化数据库连接
(async () => {
  try {
    const db = await connectToDatabase();

    // 商品数据
    const goods = [{
        img:['/image/one/1.jpg','/image/one/2.jpg','/image/one/3.jpg','/image/one/4.jpg','/image/one/5.jpg'],
        name:'现货日本进口Kirin麒麟午后红茶原味红茶饮料大瓶装整箱1.5升*8瓶',
        price:'24.14',
        active:false,
        kind:'drink'
      },
      {
        img:['/image/two/1.jpg','/image/two/2.jpg','/image/two/3.jpg','/image/two/4.jpg','/image/two/5.jpg'],
        name:'听风八百遍 才知是人间,写给独行者的生命之书 我们生而破碎正版书籍',
        price:'39.9',
        active:false,
        kind:'books'
      },
      {
        img:['/image/three/1.jpg','/image/three/2.jpg','/image/three/3.jpg','/image/three/4.jpg','/image/three/5.jpg'],
        name:'MINISO名创优品三丽鸥魔法物语系列盲盒摆件单盒潮玩摆件可爱童趣',
        price:'65.5',
        active:false,
        kind:'life'
      },
      {
        img:['/image/four/1.jpg','/image/four/2.jpg','/image/four/3.jpg','/image/four/4.jpg','/image/four/5.jpg'],
        name:'章鱼箱解可爱翻面章鱼公仔反转八爪鱼毛绒玩偶',
        price:'35.5',
        active:false,
        kind:'life'
      },
      {
        img:['/image/five/2.png','/image/five/1.png','/image/five/3png','/image/five/4.png','/image/five/5.png'],
        name:'24号不登机短袖T恤纯棉',
        price:'24.8',
        active:false,
        kind:'life'
      },
    ];

    // 插入商品数据到goods集合
    const result = await db.collection('goods').insertMany(goods);
    console.log(`${result.insertedCount} goods were inserted into the database.`);

    // 开启Express服务器
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error);
  }
})();