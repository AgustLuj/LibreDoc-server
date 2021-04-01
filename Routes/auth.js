const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const { authLoginPost, authRegisterPost } = require('../controllers');
const { validationQuerry } = require('../middlewares/validationQuerrys');

const { 
    existUser, 
    existBookId 
} = require('../helpers/dbValidation');


router.post('/login',
    check('username','El username no puede estar vacio').notEmpty(),
    check('username').custom(existUser),
    check('pass','La contranseña no puede estar vacia').notEmpty(),
    validationQuerry
,authLoginPost);

router.post('/register',
    check('username','El username no puede estar vacio').notEmpty(),
    check('username','El usuario ya esta usado').not().custom(existUser),
    check('pass','La contranseña no puede estar vacia').notEmpty(),
    validationQuerry
,authRegisterPost);

router.post('/google')

module.exports = router;
