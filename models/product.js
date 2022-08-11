const mongoose = require('mongoose');
const { STRING } = require('sequelize');


const productsSchema = mongoose.Schema({
  name:{
    type:String,
    required:true,
    minlength : [5,'Error : min Name character length should be 5 characters'],
    maxlength : [50,'Error : max Name character length should be 50 characters'],
    trim :true
  },
  price:{
    type: Number,
    required : true,
    maxlength:[7,'max Price length should be 7 characters'],
    trim : true,
    get : value => Math.round(value),
    set : value => Math.round(value)
  },
  description:{
    type:String,
    minlength:[10,'Error : min Description character length should be 50 characters'],
    maxlength:[510,'Error : max Description character length should be 510 characters'],
    trim : true
  },
  imageUrl:String,
  date:{
    type:Date,
    default:Date.now
  },
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true
  },
  isActive : Boolean,
  
  categories : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Category',
    required : true
  }]
})
module.exports = mongoose.model('Product',productsSchema)



































/*const getDb = require('../utility/database').getdb;
const mongodb = require('mongodb');
class Product{
    constructor(name,price,description,imageUrl,categories,id,userId,){
        this.name=name;
        this.price=price;
        this.description=description;
        this.imageUrl=imageUrl;
        this.categories=(categories && !Array.isArray(categories)) ? Array.of(categories) :
        categories;
        this._id=id ? new mongodb.ObjectId(id):null;
        this.userId=userId;
    }
    save(){ 
      let db = getDb();
      if(this._id){
        db = db.collection('products').updateOne({_id:this._id},{$set:this});
      }else {
        db = db.collection('products').insertOne(this);
      }
      return db
        .then(result=>{console.log(result);})
        .catch(err=>{console.log(err);})  
    }
  
    static findAll(){
        const db = getDb();
        return db.collection('products')
        .find({})
        .toArray()
        .then(products=>{
            return products;
        })
        .catch(err=>{console.log(err);})
    }
    static findById(productid){
        const db = getDb();
        return db.collection('products')
        .findOne({_id: new mongodb.ObjectId(productid)})
        .then(products=>{
            return products;
        })
        .catch(err=>{console.log(err);})
    }
    static deleteById(productid){
      const db = getDb();
      return db.collection('products')
      .deleteOne({_id:new mongodb.ObjectId(productid)})
      .then(product=>{
        return product;
      })
      .catch(err=>{console.log(err);})
    }
    static findByCategoryId(categoryid){
      const db=getDb();
      return db.collection('products')
      .find({ categories : categoryid })
      .toArray()
      .then(products=>{
        return products;
      })
      .catch(err=>{
        console.log(err)
      })

    }
  
}
module.exports=Product;*/