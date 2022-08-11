const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient
let _db;

const mongoConnect = (callback)=>{
  //MongoClient.connect('mongodb://localhost/heyo-app',{
    useNewUrlParser: true
  //})
  MongoClient.connect('mongodb+srv://serhankuyumcu:hnAYob7cubWgpsTV@cluster0.pafcb.mongodb.net/?retryWrites=true&w=majority',{
    useNewUrlParser: true
  })
  .then(client=>{
    console.log('connected');
    _db = client.db();
    callback(client);
  })
  .catch(err=>{console.log(err);
     throw err;
  })
}

const getdb = ()=>{
  if(_db){
    return _db;
  }
  throw 'No Database';
}

exports.mongoConnect = mongoConnect;
exports.getdb = getdb;