const mongoose = require('mongoose');
const Product = require('./product');
const {isEmail} = require('validator');
const loginSchema = mongoose.Schema({
    email:{
        type: String,
        required:true,
        validate : [isEmail,'Invalid email type'],
        trim : true
        },
    password : {
        type :String,
        required :[true,'You must enter a password'],
        trim : true
    },
});

module.exports = mongoose.model('Login',loginSchema)








































