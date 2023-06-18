
var jwt = require('jsonwebtoken');
module.exports=(req,res, next)=>{
    const datos = jwt.verify(req.headers.authorization, 'joaquin');
    if (datos)
    {
        req.id = datos.foo;
        next();
    }else{
        res.status(402).send({status:error})
    }
}