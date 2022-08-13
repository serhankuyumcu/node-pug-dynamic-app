const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./models/user');
const cookieParser = require('cookie-parser');
const session = require('express-session');
var   MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const csurf = require('csurf');
const sgMail = require('@sendgrid/mail');
const multer = require('multer');
const errorController = require('./controllers/error');
require('dotenv').config();
sgMail.setApiKey('env.process.SENDGRID_API_KEY')
console.log(sgMail.setApiKey('env.process.SENDGRID_API_KEY')
)





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})
//MİDDLEWARES - for public class
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({storage : storage}).single('image'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));

const DB = (process.env.DATABASE_URL);

var store = new MongoDBStore({
  uri: DB,
  collection: 'mySessions'
});
store.on('error', function(error) {
  console.log(error);
});
app.use(session({
  secret : 'keyboard dog',
  resave : false,
  saveUninitialized : false,
  cookie : {
    maxAge : 3600000
  },
  store: store
}))

app.use((req,res,next)=>{
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user=>{
      console.log(user)
      req.user = user;
      next();
    })
    .catch(err=>{console.log(err);})
});
app.use(csurf())
//PUG KURULUMU - Template Engine for Dynamic Transactions
app.set('view engine','pug');
app.set('views','./views');

//routes 
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/shop');
const accountRoutes = require('./routes/account');
app.use('/admin',adminRoutes);
app.use(userRoutes);
app.use(accountRoutes);
//ERRORS routes
app.use('/500',errorController.getError500);
app.use(errorController.getError404);
app.use((error,req,res,next)=>{
  console.log(error);
  res.status(500).render('error/500',{ title : 'Error'})
})

mongoose.connect(DB)
  .then(()=>{
    app.listen(process.env.PORT || 3010);
    console.log('connected')
  }).catch(err=>{console.log(err)});


