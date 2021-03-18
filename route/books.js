const express = require('express');
const {User,Books} = require('../models/schemaBook');
const path = require("path"); 
const fs = require("fs-extra");

const router = express.Router();
const dirO = __dirname.slice(0,-6);
router.post('/',(req,res)=>{
    Books.find({},'_id',{limit:10,sort:{copies: -1}},(err,book)=>{
        if(book != null){
            //console.log(book,skip);
            res.status(200).send(book)
            return;
        }
        res.status(200).send({err:false})
    })
});
router.post('/all',(req,res)=>{
    //let pass
    let skip = req.body.skip;
    Books.find({},'_id',{limit:10,skip},(err,book)=>{
        if(book != null){
            //console.log(book,skip);
            res.status(200).send(book)
            return;
        }
        res.status(200).send({err:false})
    })
})
router.post('/:id/all',(req,res)=>{
    let _id = req.params.id;
    Books.findById(_id,'name pages author copies',(err,book)=>{
        //console.log(book);
        res.status(200).send(book)
    });
});
router.post('/biblio/:user',(req,res)=>{
    let username = req.params.user;
    User.find({username},'mybooks.bookId mybooks.biblio',(err,books)=>{
        let book=[];
        books[0].mybooks.forEach(({bookId,biblio}) => {
            if(biblio){
                book.push({_id:bookId})
            }
        });
        res.status(200).send(book)
    })
});
router.post('/favs/:user',(req,res)=>{
    let username = req.params.user;
    User.find({username},'mybooks.bookId mybooks.favorite',(err,books)=>{
        let book=[];
        books[0].mybooks.forEach(({bookId,favorite}) => {
            if(favorite){
                book.push({_id:bookId})
            }
        });
        res.status(200).send(book)
    })
});
router.get('/:id/foto',(req,res)=>{
    let _id = req.params.id;
    Books.findById(_id,'imgName',(err,{imgName})=>{
        //console.log(imgName);
        res.setHeader('Content-type', 'image/png');
        let data;
        try{
            data =fs.readFileSync(dirO+imgName);
        }catch(e){
            console.log(e);
        }
        res.send(data);
    })
})
module.exports = router;