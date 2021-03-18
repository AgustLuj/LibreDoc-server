const express = require('express');
const {User,Books} = require('../models/schemaBook');
const path = require("path"); 
const fs = require("fs-extra");
const { PDFDocument } = require('pdf-lib');
const querystring = require('querystring');
const { rejects } = require('assert');

const router = express.Router();
const dirO = __dirname.slice(0,-6)
router.get('/',(req,res)=>{
    res.status(200).send({err:false})
});
router.post('/login',(req,res)=>{
    let {pass,username}=req.body;
    User.exists({username,pass},(err,result)=>{
        if(err){
            res.status(400).send({err:true})
        }else{
            if(result){
                res.status(200).send({login:true});
            }else{
                res.status(400).send({login:false});
            }
        }
    })
})
router.post('/register',(req,res)=>{
    let {pass,username}=req.body;
    //console.log(req.body)
    User.exists({username},(err,result)=>{
        if (err){ 
            res.status(400).send({err:true}) 
        }else{
            if(!result){
                createFile(username).then(()=>{
                    let dir ='/books/users/'+username+'/'+username+'.pdf';
                    new User({
                        username,
                        pass,
                        path:dir,
                    }).save(async(err,result)=>{
                        if (!fs.existsSync(dirO+dir)){
                            await fs.mkdirSync(dirO+dir);
                        }
                        let doc = await PDFDocument.create();    
                        doc.addPage();
                        fs.writeFileSync(dirO+dir, await doc.save());
                        res.status(200).send({username:result.username}); 
                    })
                })
                //user
            }else{
                res.status(400).send({err:true}) 
            }
        }
    })
    //res.status(200).send({err:false})
})
router.post('/search',(req,res)=>{
    let {username}=req.body;
    User.exists({username},(err,result)=>{
        if (err){ 
            console.log(err) 
        }else{
            console.log()
            if(result){
                res.status(400).send(result) 
            }else{
                res.status(200).send(result) 
            }
        }
    })
    //res.status(200).send({err:false})
})
router.post('/:user/bookReading',async(req,res)=>{
    let {user:username} = req.params;
    //AgustLuj
    const bookReading=[];
    const books=(id)=>{
        return new Promise(async resolve=>{
            await Books.findOne({'_id':id},'pages name').then(({pages,name})=>resolve({pages,name}))
        })
    }
    const mybook=async (book)=>{
        return new Promise(async resolve=>{
            for(let {start,currentPage,bookId} of book){
                if(start){
                    let {pages,name} = await books(bookId);
                    bookReading.push({currentPage,bookId,pages,name});
                }
            }
            resolve();
        })
    }
    User.findOne({username},'mybooks.start mybooks.currentPage mybooks.bookId', async(err,{mybooks})=>{
        if(mybooks != null){
            mybook(mybooks).then(()=>res.status(200).send(bookReading));
            //res.status(200).send(bookReading)
        }else{
            res.status(200).send({book:'empty'});
        }
    })
});
router.post('/:user/bookRead',async(req,res)=>{
    let {user:username} = req.params;
    //AgustLuj
    const bookReading=[];
    const books=(id)=>{
        return new Promise(async resolve=>{
            await Books.findOne({'_id':id},'pages name').then(({pages,name})=>resolve({pages,name}))
        })
    }
    const mybook=async (book)=>{
        return new Promise(async resolve=>{
            for(let {finish,bookId,stars,vote} of book){
                if(finish){
                    let {name} = await books(bookId);
                    bookReading.push({bookId,name,stars,vote});
                }
            }
            resolve();
        })
    }
    User.findOne({username},'mybooks.finish mybooks.stars mybooks.vote mybooks.bookId', async(err,{mybooks})=>{
        if(mybooks != null){
            mybook(mybooks).then(()=>res.status(200).send(bookReading));
            //res.status(200).send(bookReading)
        }else{
            res.status(200).send({book:'empty'});
        }
    })
})
router.get('/:user/read/:id',(req,res)=>{
    let {user:username,id} = req.params;
    User.findOne({username}).then(async(user)=>{
        await Books.findById({'_id':id}).then(async(book)=>{
            if(user != null){ 
                let i = user.mybooks.findIndex(({bookId})=>bookId === id);
                if(i == -1){
                    let newBook ={
                        bookId:book._id,
                        favorite:false,
                        biblio:false,
                    }
                    user.mybooks.push(newBook);
                    user.booksCount+=1;
                    let i = user.mybooks.findIndex(({bookId})=>bookId === id)
                    if(!user.mybooks[i].start){
                        book.copies+=1;
                    }
                    user.mybooks[i].start=true;
                    await user.save((err,result)=>{
                        if(err) throw err;
                        book.save(()=>{
                            return book;
                        })
                    })
                }else{
                    if(user.mybooks[i].currentPage == book.pages){
                        user.mybooks[i].start= false;
                        user.mybooks[i].finish= true;
                        //res.setHeader('Content-type', 'application/json');
                        let saveUser = await user.save();
                        res.status(200).send({finish:true});
                        return null
                        //res.end({finish:true})
                    }else{
                        if(!user.mybooks[i].start){
                            book.copies+=1;
                        }
                        user.mybooks[i].start=true;
                        let saveUser = await user.save();
                        let saveBook = await book.save();
                        return saveBook;
                    }
                }
            }else{
                res.status(400).send({err:true});
            }
        }).then(async(book)=>{
            if(book!=null){
                setTimeout(()=>{
                    let i = user.mybooks.findIndex(({bookId})=>bookId === id);
                    if(i != -1){
                        createFile(username).then(async()=>{
                            let cover;
                            try{
                                cover = await PDFDocument.load(fs.readFileSync(dirO+book.path));
                            }catch(e){
                                console.log(e);
                            }
                            let doc = await PDFDocument.create();
                            //console.log(user);
                            let more = 16
                            let a = user.mybooks[i].currentPage;
                            if(a+16>book.pages){
                                more = book.pages-a;
                            }
                            for (let i = a; i < a+more; i++) {
                                let  [c] = await doc.copyPages(cover, [i]);
                                doc.addPage(c);
                            }           
                            res.setHeader('Content-type', 'application/pdf');
                            fs.writeFileSync(dirO+user.path, await doc.save());
                            var data =fs.readFileSync(dirO+user.path);
                            res.status(200).send(data);
                            
                        })
                    }else{
                        res.status(404).send();
                    }
                },500);
            }
        }).catch((e)=>console.log(e))
    }).catch((e)=>console.log(e))
    /*           
            */
})
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

const createFile= async (username,fn)=>{
    let dir= dirO+'/books/users/'+username;
    if (!fs.existsSync(dir)){
        await fs.mkdirSync(dir);

        let doc = await PDFDocument.create();    
        doc.addPage();
        fs.writeFileSync(dir+'/'+username+'.pdf', await doc.save());
        return null;
    }
    return null;
}