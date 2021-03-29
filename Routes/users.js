const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const {User,Books} = require('../models/schemaBook');

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
    userReadIdGet
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
,bookReadPost)

router.get('/:user/read/:id',
    check('user').custom(existUser),
    check('id','No es un id valido').isMongoId(),
    check('id').custom(existBookId),
    validationQuerry
,userReadIdGet)

router.post('/:user/updatePage/:id',(req,res)=>{
    let {user:username,id} = req.params;
    let {pages} = req.body;
    //console.log(pages);
    User.findOne({username,'mybooks.bookId':id},(err,user)=>{
        if(user != null){
            let i = user.mybooks.findIndex(({bookId})=>bookId === id)
            if(user.mybooks[i].currentPage+pages <= 0){
                user.mybooks[i].currentPage=0;
            }else{
                user.mybooks[i].currentPage+=pages;
            }
            //console.log(user.mybooks[i].currentPage)
            user.save(async(err,result)=>{
                if(err) throw err;
                res.status(200).send({err:false})
            })
        }else{
            res.status(400).send({err:true})
        }
    });
})
router.post('/:user/setVote/:id',(req,res)=>{
    let {user:username,id} = req.params;
    let {vote} = req.body;
    //console.log(pages);
    User.findOne({username,'mybooks.bookId':id},(err,user)=>{
        if(user != null){
            let i = user.mybooks.findIndex(({bookId})=>bookId === id)
            user.mybooks[i].stars=vote;
            user.mybooks[i].start=false;
            user.mybooks[i].vote=true;
            user.save(async(err,result)=>{
                if(err) throw err;
                res.status(200).send({err:false})
            })
        }else{
            res.status(400).send({err:true})
        }
    });
})
router.post('/:user/add/:id',(req,res)=>{
    let {id:_id,user:username} = req.params;
    //AgustLuj
    User.findOne({username,'mybooks.bookId':_id},'booksCount mybooks.disable mybooks.biblio mybooks.bookId',(err,user)=>{
        if(user == null){
            User.findOne({username},(err,user)=>{
                if(user != null){
                    Books.findById({_id},(err,book)=>{
                        if(book != null){
                            let newBook ={
                                bookId:book._id,
                                favorite:false,
                                biblio:true,
                            }
                            user.mybooks.push(newBook);
                            user.booksCount+=1;
                            let i = user.mybooks.findIndex(({bookId})=>bookId === _id)
                            user.save((err,result)=>{
                                if (err) throw err;
                                res.status(200).send({biblio:user.mybooks[i].biblio});
                            })
                            //console.log(book);
        
                        }
                    })
                }
            })
        }else{
            let i = user.mybooks.findIndex(({bookId})=>bookId === _id)
            if(!user.mybooks[i].disable){
                if(!user.mybooks[i].biblio){
                    user.mybooks[i].biblio = true;
                }else{
                    user.mybooks[i].biblio = false;
                }
                //console.log(user.mybooks[i].biblio)
                user.save(()=>{
                    res.status(200).send({biblio:user.mybooks[i].biblio});
                })
            }else{
                res.status(400).send({});
            }
        }
    })
})
router.post('/:user/fav/:id',(req,res)=>{
    let {id:_id,user:username} = req.params;
    User.findOne({username,'mybooks.bookId':_id},'booksCount mybooks.disable mybooks.favorite mybooks.bookId',(err,user)=>{
        if(user == null){
            User.findOne({username},(err,user)=>{
                if(user != null){
                    Books.findById({_id},(err,book)=>{
                        if(book != null){
                            let newBook ={
                                bookId:book._id,
                                favorite:true,
                                biblio:false,
                            }
                            user.mybooks.push(newBook);
                            user.booksCount+=1;
                            let i = user.mybooks.findIndex(({bookId})=>bookId === _id)
                            user.save((err,result)=>{
                                if (err) throw err;
                                res.status(200).send({fav:user.mybooks[i].favorite});
                            })
                            //console.log(book);
        
                        }
                    })
                }
            })
        }else{
            let i = user.mybooks.findIndex(({bookId})=>bookId === _id)
            if(!user.mybooks[i].disable){
                if(user.mybooks[i].favorite){
                    user.mybooks[i].favorite = false;
                }else{
                    user.mybooks[i].favorite = true;
                }
                user.save((err,result)=>{
                    if(result != null){
                        //console.log(result);
                        res.status(200).send({fav:result.mybooks[i].favorite});
                    }else{
                        res.status(400).send({});
                    }
                })
            }else{
                res.status(400).send({});
            }
        }
    })
});
router.post('/:user/search/:id',(req,res)=>{
    let {id,user:username} = req.params;
    //AgustLuj
    User.findOne({username,'mybooks.bookId':id},'mybooks.favorite mybooks.biblio mybooks.disable mybooks.bookId',(err,user)=>{
        if(user != null){
            //console.log(mybooks[0]);
            let i = user.mybooks.findIndex(({bookId})=>bookId === id)
            //console.log(user,i)
            let {favorite,biblio,disable}=user.mybooks[i]
            if(!disable){
                res.status(200).send({favorite,biblio});
            }
        }else{
            res.status(200).send({favorite:false,biblio:false});
        }
    })
})
router.post('/:user/getFinish/:id',(req,res)=>{
    let {id,user:username} = req.params;
    //AgustLuj
    User.findOne({username,'mybooks.bookId':id},'mybooks.finish mybooks.bookId',(err,user)=>{
        if(user != null){
            //console.log(mybooks[0]);
            let i = user.mybooks.findIndex(({bookId})=>bookId === id)
            let {finish}=user.mybooks[i]
            if(finish){
                res.status(200).send({finish});
            }else{
                res.status(200).send({finish});
            }
        }else{
            res.status(200).send({err:true});
        }
    })
})
router.post('/:user/readAgain/:id',(req,res)=>{
    let {id,user:username} = req.params;
    //AgustLuj
    User.findOne({username,'mybooks.bookId':id},'mybooks.finish mybooks.start mybooks.currentPage mybooks.bookId').then(async(user)=>{
        if(user != null){
            //console.log(mybooks[0]);
            let i = user.mybooks.findIndex(({bookId})=>bookId === id)
            user.mybooks[i].finish = false;
            user.mybooks[i].start = true,
            user.mybooks[i].currentPage=0;
            let saveUser = await user.save();
            res.status(200).send({err:false});
        }else{
            res.status(400).send({err:true});
        }
    }).catch(e=>{console.log(e);res.status(400).send({err:true})})
})

module.exports = router;