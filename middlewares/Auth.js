

const userLogin = (req,res,next) => {
    try{
        if(!req.session?.user){
            res.redirect('/login');
        }else{
            next();
        }
    }catch(err){
        console.error('auth error ',err.message);
    }
};
const userAuthdash = (req,res,next) => {
    try{
        if(!req.session?.user){
            res.redirect('/');
        }else{
            next();
        }
    }catch(err){
        console.error('auth error ',err.message);
    }
};
const userAuthtologin = (req,res,next) => {
    try{
        if(!req.session?.user){
            res.redirect('/login');
        }else{
            next();
        }
    }catch(err){
        console.error('auth error ',err.message);
    }
};

const adminLogin = (req,res,next) => {
    try{
        if(!req.session?.admin){
            res.redirect('/admin/login');
        }else{
            next()
        }
    }catch(err){
        console.error('error on admin validation',err);
    }
}

module.exports = {
    userLogin,
    userAuthdash,
    userAuthtologin,
    adminLogin
}