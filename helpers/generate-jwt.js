const jwt = require('jsonwebtoken');

const generateJWT = async(_id = '')=>{

    return new Promise((resolve,reject)=>{
        const payload = {_id};
        
        jwt.sign(payload,process.env.SECRETPRIVATEKEY,{
            expiresIn:((60 * 60 * 24)*31)
        },(err,token)=>{
            if(err){
                console.log(err);
                reject('No se pudo generar el token');
            }else{
                resolve(token)
            }
        })

    })
}
module.exports = {
    generateJWT
};