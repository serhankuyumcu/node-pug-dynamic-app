const mongoose = require('mongoose');
const Product = require('./product');
const {isEmail} = require('validator');
const userSchema = mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type: String,
    required:true,
    validate : [isEmail,'invalid email'],
    trim : true
  },
  password : {
    type :String,
    required :true,
    trim : true
  },
  resetToken :  {
    type : String
  },
  resetTokenExpiration : Date,
  isAdmin : {
    type : Boolean,
    default : false
  },
  cart : {
        items : [{
            productId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Product',
                required: true
            },
            quantity : {
                type : Number,
                required : true
            }
        }
      ]
    }
});
userSchema.methods.addToCart = function(product){
  const index = this.cart.items.findIndex(cp=>{
        return cp.productId.toString() === product._id.toString()
    });
    const updatedCartItems = [...this.cart.items];
    let itemQuantity = 1;     
    if(index>=0){
        itemQuantity = this.cart.items[index].quantity+1;
        updatedCartItems[index].quantity = itemQuantity;
    }else{
        updatedCartItems.push({
            productId : product._id,
            quantity  : itemQuantity
        });  
    }
    this.cart = {
      items : updatedCartItems
    }
    return this.save()
  }
userSchema.methods.getCart = function (){
  const ids = this.cart.items.map(i=>{
        return i.productId;
    });
    return Product
    .find({_id:{
                $in:ids}})
    .select('name price imageUrl')
    .then(products =>{
        return products.map(p=>{
            return {
                name : p.name,
                price : p.price,
                imageUrl : p.imageUrl,
                quantity:this.cart.items.find(i=>{
                    return  i.productId.toString() === p._id.toString()
                }).quantity
              }
          });
        });
  }
userSchema.methods.deleteCartItem = function(productid){
  const cartItems = this.cart.items.filter(item=>{
    return item.productId.toString() !== productid.toString()
  });
  this.cart.items = cartItems;
  return this.save();
  }
userSchema.methods.clearCart = function() {
  this.cart = {items : []};
  return this.save()
}

module.exports = mongoose.model('User',userSchema)








































// const { mongoConnect } = require('../utility/database');
// const getDb = require('../utility/database').getdb;
// const mongodb = require('mongodb');

// class User {
//     constructor(name,email,cart,id){
//         this.name = name;
//         this.email = email;
//         this.cart = cart ? cart : {};
//         this.cart.items = cart ? cart.items : []; 
//         this._id = id;
//     }
//     save(){
//         const db = getDb();
//         return db.collection('users')
//         .insertOne(this)
//     }
//     getCart(){
//     const ids = this.cart.items.map(i=>{
//         return i.productId;
//     });
//     const db =getDb();
//     return db.collection('products')
//     .find({_id:{
//         $in:ids}})
//     .toArray()
//     .then(products =>{
//         return products.map(p=>{
//             return {
//                 ...p,
//                 quantity:this.cart.items.find(i=>{
//                     return  i.productId.toString() === p._id.toString()
//                 }).quantity
//                 }
//             })
//         })
//     }
//     addToCart(product){
//     const index = this.cart.items.findIndex(cp=>{
//         return cp.productId.toString() === product._id.toString()
//     });
//     const updatedCartItems = [...this.cart.items];
//     let itemQuantity = 1;      if(index>=0){
//         itemQuantity = this.cart.items[index].quantity+1;
//         updatedCartItems[index].quantity = itemQuantity;
//     }else{
//         updatedCartItems.push({
//             productId : new mongodb.ObjectId(product._id),
//             quantity  : itemQuantity
//         });  
//     }
//     const db = getDb();
//     return db.collection('users')
//         .updateOne({_id : new mongodb.ObjectId(this._id)},{
//             $set : {
//                 cart : {
//                     items : updatedCartItems
//         }
//     }})
//     }
//     static findByUserName(username){
//         const db = getDb();
//             return db.collection('users')
//                 .findOne({name:username})
//         .then(user=>{
//             return user;
//         })
//         .catch(err=>{console.log(err);})
//     }
//     static findById(userid){
//         const db = getDb();
//         return db.collection('users')
//         .findOne({_id:new mongodb.ObjectId(userid)})
//         .then(user=>{
//             return user;
//         })
//         .catch(err=>{console.log(err);})
//     }
//     deleteCartItem(productid){
//         const cartItems = this.cart.items.filter(item=>{
//         return item.productId.toString() !== productid.toString()
//         });
//         const db = getDb();
//         return db .collection('users')
//         .updateOne(
//             {_id:new mongodb.ObjectId(this._id)},{$set : {
//             cart : {items : cartItems }
//         }})
//     }
//     addOrder(){
//         //get cart
//         //create order object
//         //save order
//         //update cart
//         const db = getDb();
//         return this.getCart()
//         .then(products=>{
//             const order = {
//                 items : products.map(item=>{
//                     return {
//                         id : item._id,
//                         name : item.name,
//                         price : item.price,
//                         imageUrl : item.imageUrl,
//                         userId : item.userid,
//                         quantity : item.quantity
//                     }
//                 }),
//                 user : {
//                     _id :new mongodb.ObjectId(this._id),
//                     name : this.name,
//                     email : this.email
//             },
//                 date : new Date().toLocaleString()
//             };
//             return db.collection('orders').insertOne(order)
//         })
//         .then(()=>{
//             this.cart = { items : []};
//             return db.collection('users')
//             .updateOne({
//                 _id : new mongodb.ObjectId(this._id)},{
//                     $set : {cart : {items : []}}
//             })
//         })
//         .catch(err=>{
//             console.log(err);
//         })
//     }
//     getOrders(){
//         const db = getDb();
//         return db.collection('orders')
//         .find({'user._id' : new mongodb.ObjectId(this._id)})
//         .toArray()
//     }
// }
// module.exports=User;