const {response} = require('express');
const path = require("path"); 
const fs = require("fs-extra");
const { PDFDocument } = require('pdf-lib');

const {User,Books} = require('../models/schemaBook');
const { createFile } = require('../helpers/createFile');

const rootUser = (req,res=response)=>{
    res.status(200).json({err:false})
}

const loginPost = async(req,res=response)=>{
    try {
        let {pass,username}=req.body;

        let user = await User.exists({username,pass})

        if(user){
            return res.status(200).json({login:true});
        }else{
            return res.status(400).json({login:false});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })
    }
}

const registerPost = async(req,res=response)=>{
    try {
        
        let {pass,username}=req.body;
        let file = await createFile(username);
        
        if(file){
            let dir ='/books/users/'+username+'/'+username+'.pdf';
            let user = new User({
                username,
                pass,
                path:dir,
            })
            let save = await user.save();
            if(save){

                let dirfull = path.join(__dirname,`..${dir}`);
                
                let doc = await PDFDocument.create();    

                doc.addPage();

                fs.writeFileSync(dirfull, await doc.save());

                return res.status(200).json({username});
            }
            return res.status(400).json({msg:'No se pudo completar el registro'}); 
        }
        return res.status(400).json({msg:'No se pudo completar el registro'}); 

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const bookReadingPost  = async(req,res=response)=>{
    try {
        
        let {id:_id} = req.params;
        
        const bookReading=[];

        let {mybooks} = await User.findById({_id});
        if(mybooks){
            for(let {start,currentPage,bookId} of mybooks){
                if(start){
                    let {pages,name} = await Books.findOne({'_id':bookId});
                    bookReading.push({currentPage,bookId,pages,name});
                }
            }
            return res.status(200).json(bookReading);
        }
        return res.status(400).json({msg:'No se encontraron libros'});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const bookReadPost = async(req,res=response)=>{
    try {
       
        let {id:_id} = req.params;
        
        const bookReading=[];

        let {mybooks} = await User.findById({_id});
        if(mybooks){
            for(let {finish,bookId,stars,vote} of mybooks){
                if(finish){
                    let {name} = await Books.findOne({'_id':bookId});
                    bookReading.push({bookId,name,stars,vote});
                }
            }
            return res.status(200).json(bookReading);
        }
        return res.status(400).json({msg:'No se encontraron libros'}); 

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const userReadIdGet = async(req,res=response)=>{
    try {
        
        let {user:username,id} = req.params;

        let user = await User.findOne({username});
        let book = await Books.findById({'_id':id});
        if(user && book){
            let {mybooks,booksCount} = user;
            let {pages} = book;
            let i = mybooks.findIndex(({bookId})=>bookId === id);
            /// Busca y actualiza los datos del usuario y libros
            if(i == -1){
                let newBook ={
                    bookId:book._id,
                    favorite:false,
                    biblio:false,
                }
                mybooks.push(newBook);
                booksCount+=1;

                let i = mybooks.findIndex(({bookId})=>bookId === id)
                if(!mybooks[i].start){
                    book.copies+=1;
                    user.mybooks[i].start=true;
                }
                await user.save(),book.save();
            }else{
                if(mybooks[i].currentPage == book.pages){
                    mybooks[i].start = false;
                    mybooks[i].finish= true;
                    await user.save();
                    return res.status(200).json({finish:true});
                }else{
                    if(!mybooks[i].start){
                        book.copies+=1;
                        mybooks[i].start=true;
                        await user.save(),book.save();
                    }
                }
            }

            i = mybooks.findIndex(({bookId})=>bookId === id);
            /// Crea el documento para enviarselo al usuario
            if(i != -1){
                let file = await createFile(username);
                let dirbook = path.join(__dirname,`..${book.path}`);
                let dirUser = path.join(__dirname,`..${user.path}`);
                if(file){
                    let cover;
                    try{
                        cover = await PDFDocument.load(fs.readFileSync(dirbook)); /// Buca el pdf origianal
                    }catch(e){
                        console.log(e);
                    }
                    let doc = await PDFDocument.create(); // Crea un pdf vacio

                    let more = 16
                    let a = mybooks[i].currentPage;//calcula las paginas que tiene que agregar
                    if(a+16>pages){
                        more = pages-a;
                    }
                    for (let i = a; i < a+more; i++) {
                        let  [c] = await doc.copyPages(cover, [i]);//copia las paginas del original y lo pega en el pdf nuevo
                        doc.addPage(c);
                    }           
                    res.setHeader('Content-type', 'application/pdf');
                    fs.writeFileSync(dirUser, await doc.save());//guarda el pdf en el path DirUSer
                    var data =fs.readFileSync(dirUser);//Busca el pdf guardado 
                    return res.status(200).send(data);
                }
            }
            return res.status(404).json({msg:'Error Desconocido, contactar con el admin'}) 
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const userUpdatePageIdPost = async(req,res=response)=>{
    try {
        
        let {user:username,id} = req.params;
        let {pages=1} = req.body;

        let user = await User.findOne({username});
        
        let {mybooks} = user
        if(user){
            let i = mybooks.findIndex(({bookId})=>bookId === id)
            let {currentPage} = mybooks[i];
            
            if(currentPage+pages <= 0){
                mybooks[i].currentPage=0;
            }else{
                mybooks[i].currentPage+=pages;
            }
            await user.save();
            return res.status(200).json({err:false})
        }else{
            return res.status(400).json({err:true})
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const setVotePost = async(req,res=response)=>{
    try {
        let {user:username,id} = req.params;
        let {vote} = req.body;
        //console.log(pages);
        let user = User.findOne({username,'mybooks.bookId':id})
        if(user){

            let i = user.mybooks.findIndex(({bookId})=>bookId === id)
            user.mybooks[i].stars=vote;
            user.mybooks[i].start=false;
            user.mybooks[i].vote=true;

            await user.save();

            res.status(200).json({err:false});

        }else{
            return res.status(400).json({msg:'No se encontraron el usuario'}); 
        }  
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const userAddIdPost = async(req,res=response)=>{
    try {
        
        let {id:_id,user:username} = req.params;

        let user = await User.findOne({username});
        let i = user.mybooks.findIndex(({bookId})=>bookId === _id)
        let book = await Books.findById({_id});
        if(i == -1){
            if(book){
                let newBook ={
                    bookId:book._id,
                    favorite:false,
                    biblio:true,
                }
                user.mybooks.push(newBook);
                user.booksCount+=1;

                let i = user.mybooks.findIndex(({bookId})=>bookId === _id)
                await user.save();
                return res.status(200).json({biblio:user.mybooks[i].biblio});
            }
        }else{
            let {disable,biblio} = user.mybooks[i];
            if(!disable){
                if(!biblio){
                    user.mybooks[i].biblio = true;
                }else{
                    user.mybooks[i].biblio = false;
                }
                await user.save()
                return res.status(200).json({biblio:user.mybooks[i].biblio});
            }else{
                return res.status(404).json({msg:'Error Desconocido, contactar con el admin'}) 
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const userFavIdPost = async(req,res=response)=>{
    try {
        
        let {id:_id,user:username} = req.params;

        let user = await User.findOne({username});
        let i = user.mybooks.findIndex(({bookId})=>bookId === _id)
        let book = await Books.findById({_id});
        if(i == -1){
            if(book){
                let newBook ={
                    bookId:book._id,
                    favorite:true,
                    biblio:false,
                }
                user.mybooks.push(newBook);
                user.booksCount+=1;

                let i = user.mybooks.findIndex(({bookId})=>bookId === _id)
                await user.save();
                return res.status(200).json({favorite:user.mybooks[i].favorite});
            }
        }else{
            let {disable,favorite} = user.mybooks[i];
            if(!disable){
                if(favorite){
                    user.mybooks[i].favorite = false;
                }else{
                    user.mybooks[i].favorite = true;
                }
                //await user.save()
                return res.status(200).json({favorite:user.mybooks[i].favorite});
            }else{
                return res.status(404).json({msg:'Error Desconocido, contactar con el admin'}) 
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}
const userSearchIdPost = async(req,res=response)=>{
    try {
        
        let {id,user:username} = req.params;
        let user = User.findOne({username,'mybooks.bookId':id})
        if(user){
            let i = user.mybooks.findIndex(({bookId})=>bookId === id)

            let {favorite,biblio,disable}=user.mybooks[i]
            if(!disable){
                res.status(200).json({favorite,biblio});
            }
        }
        return res.status(200).json({favorite:false,biblio:false});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const userGetFinishIdPost = async(req,res=response)=>{
    try {
        
        let {id,user:username} = req.params;
        let {mybooks} = User.findOne({username,'mybooks.bookId':id});

        if(mybooks){
            let i = mybooks.findIndex(({bookId})=>bookId === id)

            let {finish}=mybooks[i];

            if(finish){
                return res.status(200).json({finish});
            }else{
                return res.status(200).json({finish});
            }
        }else{
            return res.status(200).json({err:true});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

const userReadAgainIdPost = async(req,res=response)=>{
    try {
        let {id,user:username} = req.params;
        let user = User.findOne({username,'mybooks.bookId':id});
        let {mybooks} = user;
         if(user != null){
            let i = mybooks.findIndex(({bookId})=>bookId === id)
            mybooks[i].finish = false;
            mybooks[i].start = true,
            mybooks[i].currentPage=0;
            await user.save();
            return res.status(200).json({err:false});
        }else{
            return res.status(400).json({err:true});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}

module.exports={rootUser,loginPost,registerPost,bookReadingPost,bookReadPost,userReadIdGet,userUpdatePageIdPost,setVotePost,userAddIdPost,userFavIdPost,userSearchIdPost,userGetFinishIdPost,userReadAgainIdPost}