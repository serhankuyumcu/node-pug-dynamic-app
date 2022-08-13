const User = require('../models/user');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto');
const Login = require('../models/login');

exports.getLogin = (req,res,next)=>{
    var successMessage = req.session.successMessage;
    delete req.session.successMessage;
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    var errorMessagePw = req.session.errorMessagePw;
    delete req.session.errorMessagePw;
    res.render('account/login',{
        title : 'Login',
        path : '/account/login',
        errorMessage:errorMessage,
        errorMessagePw:errorMessagePw,
        succcessMessage:successMessage
    })
}
exports.postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password; 

    const LoginModel = new Login({
        email:email,
        password:password
    })
    LoginModel
    .validate()
    .then(()=>{
        User.findOne({email : email })
    .then(user=>{
        if(!user){
            req.session.errorMessage='Email is not true';
            req.session.save(function(err){
                console.log(err);
                res.redirect('/login');
            })
        }
        bcrypt.compare(password,user.password)
        .then(isSuccess=>{
            if(isSuccess){
                req.session.user = user,
                console.log(user)
                req.session.isAuthenticated = true;
                return req.session.save(function(err){
                    var url = req.session.redirectTo || '/';
                    delete req.session.redirectTo;
                    return res.redirect(url)
                })
            }
            req.session.errorMessage='Password is not true';
            req.session.save(function(err){
                console.log(err);
                res.redirect('/login')
            })
        }).catch(err=>{console.log(err);})
    }).catch(err=>{console.log(err);})
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            let message = '';
            for(field in err.errors){
                message += err.errors[field].message + '<br>';
            }
            res.render('account/login',{
                title : 'Login',
                path : '/login',
                errorMessage:message,  
            })
        }else{
            next(err);
        }
    })
}
exports.getRegister = (req,res,next)=>{
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render('account/register',{
        title : 'Register',
        path : '/account/register',
        errorMessage:errorMessage
    })
}
exports.postRegister = (req,res,next)=>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email : email})
    .then(user=>{
        if(user){
            return  res.redirect('/register')
        }
            return bcrypt.hash(password,10)
        .then(hashedPassword=>{
            const newUser = new User({
                name : name,
                email : email,
                password : hashedPassword,
                cart : {items : []}
            });
            return newUser.save() 
        })  
        .then(()=>{   
                res.redirect('/login')
                const msg = {
                to: email, // Change to your recipient
                from: 'serhankuyumcu7@gmail.com', // Change to your verified sender
                subject: 'Registration is done',
                html: '<h1>Succesfull Registration</h1>',
                }
            transport.sendMail(msg);
                
        })
        .catch(err=>{
            if(err.name === 'ValidationError'){
                let message = '';
                for(field in err.errors){
                    message += err.errors[field].message + '<br>';
                }
                res.render('account/register',{
                    title : 'Register',
                    path : '/register',
                    errorMessage:message,  
                })
            }else{
                next(err);
            }
        })
    })
}
exports.getReset = (req,res,next)=>{
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage
    res.render('account/reset-password',{
        title        : 'Reset-Password',
        path         : '/reset-password',
        errorMessage : errorMessage
    })
}
exports.postReset = (req,res,next)=>{
    const email = req.body.email;
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
            return  res.redirect('/reset-password')
        }
        const token = buffer.toString('hex');
        User.findOne({email:email})
        .then(user=>{
            if(!user){
            req.session.errorMessage='User is not found';
            req.session.save(function(err){
            console.log(err);
            res.redirect('/reset-password');
            })
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now()+3600000;
            return user.save();
        })
        .then(result=>{
        res.redirect('/')
        const msg = {
            to: email, // Change to your recipient
            from: 'serhankuyumcu7@gmail.com', // Change to your verified sender
            subject: 'Reset-Password',
            html: `
                    <p>Click to button for changing password</p>
                   <p>
                        <a href="http:localhost:3010/reset-password/${token}
                        ">Reset Password</a>  
                    </p>',
                    `,
        };
        sgMail.send(msg)
        }).catch(err=>{next(err);})
    })
} 
exports.getNewPassword =(req,res,next)=> {
    const token = req.params.token;
    User.findOne({
        resetToken : token,
        resetTokenExpiration : {
            $gt : Date.now()
        }
    })
    .then(user=>{

        var errorMessage = req.session.errorMessage;
        delete req.session.errorMessage;
        res.render('account/new-password',{
            title : 'New Password',
            path : '/new-password',
            errorMessage:errorMessage,
            userId : user._id.toString(),
            passwordToken : token
        })  
    }).catch(err=>{next(err);})
}
exports.postNewPassword =(req,res,next)=> {
    const newPassword = req.body.password;
    const newPassword2 = req.body.password2;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let _user;
    User.findOne({
        resetToken : token, 
        resetTokenExpiration : {
            $gt : Date.now()
        },
        _id : userId
    }).then(user=>{
        if(newPassword == newPassword2){
            _user = user;
            return bcrypt.hash(newPassword,10)
        }
        req.session.errorMessage='Passwords are not equal';
        return req.session.save(function(err){
                console.log(err);
        })
    })
    .then(hashedPassword=>{
        _user.password = hashedPassword;
        _user.resetToken = undefined;
        _user.resetTokenExpiration = undefined;
        return _user.save()
    })
    .then(()=>{
        res.redirect('/login')
    })
    .catch(err=>{
        next(err);
    })
}
exports.getLogout = (req,res,next)=>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/')
    })
}