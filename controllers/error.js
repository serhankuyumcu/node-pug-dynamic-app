exports.getError404 = (req,res)=>{
    res.status(404).render('error/404',{title:'Page Not Found'});
}; 

exports.getError500 = (req,res)=>{
    res.status(500).render('error/500',{title:'Unexpected Error'});
}; 