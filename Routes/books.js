const express = require('express');
const { check } = require('express-validator');

const { validationQuerry } = require('../middlewares/validationQuerrys');
const { validarJWT } = require('../middlewares/validationToken');

const { 
    rootBookPost,
    allBookPost, 
    idAllBookPost, 
    biblioUserBookPost, 
    favUserBookPost,
    fotoIdGet
} = require('../controllers');

const { existUser } = require('../helpers/dbValidation');



const router = express.Router();


router.post('/',rootBookPost);

router.post('/all',
    check('skip','Se necesita el parametro skip').notEmpty(),
    validationQuerry
,allBookPost)

router.post('/biblio/:user',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user','El username no puede estar vacio').notEmpty(),
    check('user').custom(existUser),
    validationQuerry
,biblioUserBookPost);

router.post('/favs/:user',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user','El username no puede estar vacio').notEmpty(),
    check('user').custom(existUser),
    validationQuerry
,favUserBookPost);

router.post('/:id/all',
    check('id','id no valido').isMongoId(),
    validationQuerry
,idAllBookPost);

router.get('/:id/foto',
    check('id','id no valido').isMongoId(),
    validationQuerry
,fotoIdGet);

module.exports = router;