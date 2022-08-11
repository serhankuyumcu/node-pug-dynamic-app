const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const Order = require('../models/order');
const sgMail = require('@sendgrid/mail')

exports.getIndex = (req,res,next)=>{
   console.log(req.user);
   Product.find()
   .then(products =>{
      return products
   }).then(products=>{
         Category.find().then(categories=>{
            res.render('shop/index',{
               title:'Shopping', 
               products:products,
               categories:categories,
               path:'/',
               isAuthenticated : req.session.isAuthenticated,
            });
            })
         }).catch((err=>{next(err);}
      ))
}

exports.getProducts = (req,res,next)=>{
   Product.find().then(
      products =>{
         return products;
      }).then(products=>{
         Category.find().then(categories=>{
            res.render('shop/products',{
               title:'Shopping', 
               products:products,
               categories:categories,
               path:'/products',
               isAuthenticated : req.session.isAuthenticated,
            });
              })
         }).catch((err=>{next(err);}))
   .catch((err=>{next(err);}));
};

exports.getProduct = (req,res,next)=>{
   Product.findOne({_id:req.params.productid})
   .then(product=>{
      res.render('shop/product-details',{
         title : 'product.name',
         product : product,
         path : '/products',
      });
   })
   .catch((err)=>{
      next(err);
   });
}

exports.getProductDetails = (req,res,next)=>{
   res.render('shop/product-details',{
      title : Details,
      path : '/product-details',
   });
};

exports.getProductsByCategoryId = (req,res,next)=>{
   const categoryid = req.params.categoryid;
   const model = [];
   Category.find()
   .then(categories=>{
      model.categories = categories;
      return Product.find({
         categories:categoryid});
      })
   .then(products=>{
         res.render('shop/products',{
            title:'Products', 
            products:products,
            categories:model.categories,
            selectedCategory : categoryid,
            path:'/products',
         });

      })
   .catch(err=>{next(err);})  
}

exports.postCart = (req,res,next)=>{   
   const productId= req.body.productId;
   Product.findById(productId)
      .then(product=>{

         return req.user.addToCart(product);
      })
      .then(()=>{
         res.redirect('/cart');
      })
      .catch(err=>{
         next(err);
      })
}

exports.getCart = (req,res,next)=>{
   req.user
      .populate('cart.items.productId')
      .then(user=>{
         console.log(user.cart.items);
         res.render('shop/cart',{
            title:'Cart',
            path:'/cart',
            products:user.cart.items,
         });
      }).catch(err=>{next(err);})
}

exports.postCartItemDelete = (req,res,next)=>{
   const productid = req.body.productid;
   req.user
      .deleteCartItem(productid)
      .then(()=>{
         res.redirect('/cart');
      })
};

exports.getOrders = (req,res,next)=>{
   Order.find({'user.userId' : req.user._id})
      .then(orders=>{
         console.log(orders)
         res.render('shop/orders',{
            title: 'Orders',
            path:'/orders',
            orders:orders,
         })
      }).catch(err=>{next(err);})

};

exports.postOrder = (req,res,next)=>{
  req.user
   .populate('cart.items.productId')
   //.execPopulate()
   .then(user=>{
      const order = new Order ({
         user : {
            userId : req.user._id,
            name   : req.user.name,
            email  : req.user.email
         },
         items : user.cart.items.map(p=>{
            return { 
               product : {
                  _id      : p,
                  name     : p.productId.name,
                  price    : p.productId.price,
                  imageUrl : p.productId.imageUrl
               },
               quantity : p.quantity
               };
            })
         })
         return order.save()
   })
   .then(()=>{
      req.user.clearCart()
   })
   .then(()=>{
      res.redirect('/orders')
      
      const msg = {
         to: 'serhankuyumcu7@gmail.com', // Change to your recipient
         from: 'serhankuyumcu7@gmail.com', // Change to your verified sender
         subject: 'Order Information',
         html: `
                  <p>These Items has Ordered</p>
                  <p> #{}                       </p>,
                 `,
     };
     sgMail.send(msg)
   })
   .catch(err=>{
      next(err);
   })
};