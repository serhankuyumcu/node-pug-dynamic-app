const Product = require('../models/product');
const Category = require('../models/category');
const fs = require('fs');
exports.getProducts = (req,res,next) =>{
    Product.find({userId:req.user._id})
   .populate('userId','name -_id')
   .select('name price imageUrl userId')
   .then(products=>{
        res.render('admin/products',{
            title:'Admin Products',
            products:products,
            path:'/admin/products',
            action:req.query.action,
        })
   }).catch(err=>{next(err);})
}  

exports.getAddProduct = (req,res,next)=>{
    Category.find({userId:req.user._id})
    .then(categories=>{
        res.render('admin/add-product',
        {title:'New Product',
        path :'/admin/add-product',
        categories:categories,
        
        });
    }).catch(err=>{console.log(err)})
}  

exports.postAddProduct = (req,res,next)=>{
    const name = req.body.name;
    const price = req.body.price;
    const image= req.file;
    const description=req.body.description;
    const categories=req.body.categoryids;
    const product = new Product({
        name:name,
        price:price,
        imageUrl:image.filename,
        description:description,
        categories:categories,
        userId : req.user._id,
        isActive : true
    })
    product.save ()
    .then(()=>{
            res.redirect('/admin/products');
        })
    .catch(err=>{
        let message = '';
        if(err.name = 'ValidationError'){
            for(field in err.errors){
                message += err.errors[field].message + '<br>'
            }   
        }
        Category.find({userId:req.user._id})
        .then(categories=>{
        res.render('admin/add-product',{
            title:'New Product',
            path :'/admin/add-product',
            errorMessage : message,
            categories : categories,
            // inputs : {
            //     name        : name,
            //     price       : price,
            //     descripton  : description,
            //     imageUrl    : image.filename
            // }
        });
    });
})
}

exports.getEditProduct = (req,res,next)=>{  
    Product.findOne(
        {_id:req.params.productid,userId:req.user._id
        })
    .populate('categories','name -_id')
    .then(product=>{
        if(!product){
            res.redirect('/');
        }
        return product;})
    .then(product=>{
        Category.find()
            .then(categories=>{
                categories = categories.map(category=>{
                    if(product.categories){
                        product.categories.find(item=>{
                            if(item.toString() === category._id.toString()){
                                category.selected = true;
                            }
                        })
                    }
                    return category
                })
                res.render('admin/edit-product',{
                    title:'Edit-Product',
                    path:'/admin/products',
                    product:product,
                    categories:categories,
                    
                });
            })    
        }).catch(err=>{next(err);});
    }  

exports.postEditProduct = (req,res,next)=>{
    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const image = req.file;
    const description = req.body.description;
    const ids = req.body.categoryids;
    
    Product.findOne({_id:id,userId:req.user._id})
    .then(product=>{
        if(!product){
            res.redirect('/')
        }
        product.name=name,
        product.price=price,
        product.description=description,
        product.categories=ids
        if(image){
            fs.unlink('public/img/'+ product.imageUrl,err=>{
                if(err){
                    console.log(err)
                }
            })
            product.imageUrl = image.filename
        }
        return product.save();
    }).then(result=>{
        res.redirect('/admin/products?action=edit');
    }).catch(err=>{console.log(err)})  
   
}
exports.postDeleteProduct = (req,res,next)=>{
    const id = req.body.productid;
    Product.findOne({ _id:id, userId:req.user._id })
    .then(product=>{
        if(!product){
            return next(new Error('No Product for Delete'))
        }
        fs.unlink('public/img/'+ product.imageUrl,err=>{
            if(err){
                console.log(err)
            }
        });
        return Product.deleteOne({_id:id,userId:req.user._id})
        .then((result)=>{
            if(result.deletedCount === 0){
                return next(new Error('No Product for Delete'))
            }
            res.redirect('/admin/products?action=delete');
        })
        .catch(err=>{next(err);});
    })  
}

exports.getCategories = (req,res,next)=>{
    Category.find()
    .then(categories=>{
         res.render('admin/categories',{
             title:'Categories',
             //products:products,
             categories:categories,
             path:'/admin/categories',
             action:req.query.action,
         })
    }).catch(err=>{next(err);})
}

exports.getAddCategory = (req,res,next)=>{
    Category.find()
    .then(categories=>{
        res.render('admin/add-category',{
            title:'Add-Category',
            path:'/admin/add-category',
            categories:categories,
            action:req.query.action,
        });
    }).catch(err=>{next(err);})
}

exports.postAddCategory = (req,res,next)=>{
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    const category = new Category({
        name:name,
        description:description
    });
    category.save()
    .then(result=>{
        console.log('updated');
        res.redirect('/admin/categories?action=add');
    })  
    .catch(err=>{next(err);});
}

exports.postDeleteCategory = (req,res,next)=>{
    const id = req.body.categoryid;
     Category.deleteOne({id:id,userId:req.user._id}).then(()=>{
            res.redirect('/admin/categories?action=delete');
        })
        .catch(err=>{next(err);;});
}

exports.getEditCategory = (req,res,next)=>{  
    Category.findById(req.params.categoryid)
    .then(category=>{
        return res.render('admin/edit-category',{
            title     : 'Edit-Category',
            path      : '/admin/edit-category',
            category  : category
        })
    }).catch(err=>{next(err);});
}  

exports.postEditCategory = (req,res,next)=>{  
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    Category.updateOne({_id:id,userId:req.user._id},{$set : {
        name:name,
        description:description
    }})
    .then(result=>{
        console.log('updated');
        res.redirect('/admin/categories?action=edit');
    })  
    .catch(err=>{next(err);});
}  

















































//STANDART MYSQL METHODS
// const Product = require('../models/product');
// const Category = require('../models/category')
// exports.getProducts = (req,res,next) =>{
//     Product.getAll().then(
//         products =>{res.render('admin/products',{
//             title:'Admin Products', 
//             products:products[0],
//             path:'/admin/products',
//             action : req.query.action});
//         })
//     .catch((err=>{console.log(err)}));
// }
// exports.getAddProduct = (req,res,next)=>{  
//     Category.getAll()
//     .then((categories)=>{
//             res.render(
//                 'admin/add-product',
//                 {title:'New Product',
//                  path :'/admin/add-product',
//                  categories:categories[0]
//             });   
//         })
//     .catch((err=>{console.log(err)}));
//     //res.sendFile(path.join(__dirname,'../','views','add-product.html'));
// }    // res.send('add-product');
// exports.postAddProduct = (req,res,next)=>{
//     const product = new Product();
//     product.name = req.body.name;
//     product.price = req.body.price;
//     product.imageUrl = req.body.imageUrl;
//     product.categoryid = req.body.categoryid;
//     product.description = req.body.description;
//     product.saveProduct()
//     .then(
//         ()=>{
//             res.redirect('/products?action=add'); 
//                 }
//     ).catch((err=>{console.log(err)}));
//     //products.push({name:req.body.name,price:req.body.price,image:req.body.image,description:req.body.description});
//     //console.log(req.body);
// };
// exports.getEditProduct = (req,res,next)=>{  
//     //res.sendFile(path.join(__dirname,'../','views','add-product.html'));
//     // res.send('add-product');
//     Product.getById(req.params.productid)
//     .then(
//         (product)=>{
//             res.render(
//                 Category.getAll()
//                 .then(
//                     (categories)=>{
//                         res.render(
//                             'admin/edit-product',
//                             {title:'Edit Product',
//                             path :'/admin/products',
//                             product:product[0][0],
//                             categories : categories[0]
//                         }); 
//                     })
//                 .catch((err=>{console.log(err)}))
//             )}
// ) .catch((err=>{console.log(err)}))}    
// exports.postEditProduct = (req,res,next)=>{
//     const product = new Product();
//     product.id=req.body.id;
//     product.name = req.body.name;
//     product.price = req.body.price;
//     product.imageUrl = req.body.imageUrl;
//     product.description = req.body.description;
//     product.categoryid = req.body.categoryid;
//     Product.update(product)
//     .then(()=>{
//         res.redirect('/admin/products?action=edit')
//     })  
//     .catch((err=>{console.log(err)}));
// };

// exports.postDeleteProduct = (req,res,next)=>{
//     Product.DeleteById(req.body.productid)
//     .then(()=>{
//         res.redirect('/admin/products?action=delete')
//     })
//     .catch((err=>{console.log(err)}));
// }

