const MongoClient = require('mongodb').MongoClient;

// 数据库连接URL，如果是远程数据库或需要认证，请按之前讨论的方式填写
const uri = 'mongodb://localhost:27017';

// 数据库名称
const dbName = 'courier';

// 创建数据库连接函数
const connectToDatabase = async () => {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB successfully');
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

module.exports = connectToDatabase;