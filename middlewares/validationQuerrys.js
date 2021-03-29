const { validationResult } = require("express-validator");

const validationQuerry = (req,res,next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json(errors);
    }
    next();
}
module.exports = {
    validationQuerry
}