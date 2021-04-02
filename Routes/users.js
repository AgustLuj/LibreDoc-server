const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const { 
    existUser, 
    existBookId 
} = require('../helpers/dbValidation');

const { validationQuerry } = require('../middlewares/validationQuerrys');
const { validarJWT } = require('../middlewares/validationToken');

const { 
    rootUser, 
    bookReadingPost,
    bookReadPost,
    userReadIdGet,
    userUpdatePageIdPost,
    setVotePost,
    userAddIdPost,
    userFavIdPost,
    userSearchIdPost,
    userGetFinishIdPost,
    userReadAgainIdPost
} = require('../controllers');


router.get('/',rootUser);

router.post('/:user/bookReading',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    validationQuerry
,bookReadingPost);

router.post('/:user/bookRead',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    validationQuerry
,bookReadPost);

router.get('/:user/read/:id',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userReadIdGet);

router.post('/:user/updatePage/:id',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    check('pages','Es pages no puede estar vacio').notEmpty(),
    validationQuerry
,userUpdatePageIdPost);

router.post('/:user/setVote/:id',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    check('vote','Es vote no puede estar vacio').notEmpty(),
    validationQuerry
,setVotePost);

router.post('/:user/add/:id',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userAddIdPost);

router.post('/:user/fav/:id',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userFavIdPost);

router.post('/:user/search/:id',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userSearchIdPost);

router.post('/:user/getFinish/:id',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT,
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userGetFinishIdPost);

router.post('/:user/readAgain/:id',
    check('x-token','Es necesario el token').notEmpty(),
    check('x-token','Es necesario el token').isJWT(),
    validarJWT, 
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userReadAgainIdPost)

module.exports = router;