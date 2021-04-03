const { validationResult } = require("express-validator");

const validationQuerry = (req,res,next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(500).json(errors);
    }
    next();
}
module.exports = {
    validationQuerry
}