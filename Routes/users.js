const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const { 
    existUser, 
    existBookId 
} = require('../helpers/dbValidation');

const { validationQuerry } = require('../middlewares/validationQuerrys');

const { 
    rootUser, 
    loginPost, 
    registerPost,
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

router.post('/login',
    check('username','El username no puede estar vacio').notEmpty(),
    check('username').custom(existUser),
    check('pass','La contranseña no puede estar vacia').notEmpty(),
    validationQuerry
,loginPost);

router.post('/register',
    check('username','El username no puede estar vacio').notEmpty(),
    check('username','El usuario ya esta usado').not().custom(existUser),
    check('pass','La contranseña no puede estar vacia').notEmpty(),
    validationQuerry
,registerPost);

router.post('/:id/bookReading',
    check('id','No es un id valido').isMongoId(),
    validationQuerry
,bookReadingPost);

router.post('/:id/bookRead',
    check('id','No es un id valido').isMongoId(),
    validationQuerry
,bookReadPost);

router.get('/:user/read/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userReadIdGet);

router.post('/:user/updatePage/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    check('pages','Es pages no puede estar vacio').notEmpty(),
    validationQuerry
,userUpdatePageIdPost);

router.post('/:user/setVote/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    check('vote','Es vote no puede estar vacio').notEmpty(),
    validationQuerry
,setVotePost);

router.post('/:user/add/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userAddIdPost);

router.post('/:user/fav/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userFavIdPost);

router.post('/:user/search/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userSearchIdPost);

router.post('/:user/getFinish/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userGetFinishIdPost);

router.post('/:user/readAgain/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userReadAgainIdPost)

module.exports = router;