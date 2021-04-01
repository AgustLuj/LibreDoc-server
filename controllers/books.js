const { response} = require('express');
const {User,Books} = require('../models/schemaBook');
const path = require("path"); 
const fs = require("fs-extra");

const rootBookPost = async (req,res=response)=>{
    try {
        
        let book = await Books.find({},'_id',{limit:10,sort:{copies: -1}});

        if(book){
            //console.log(book,skip);
            return res.status(200).json(book)
        }
        return res.status(400).json({msg:'No se encontraron libros'});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })
    }
}

const allBookPost = async(req,res=response)=>{
    try {
        let {skip}=req.body

        let book = await Books.find({},'_id',{limit:10,skip})

        if(book){
            return res.status(200).json(book)
        }
        return res.status(400).json({msg:'No se encontraron libros'});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })
    }
    

}

const idAllBookPost = async(req,res=response)=>{
    try {
        let _id = req.params.id;

        let book = await Books.findById(_id,'name pages author copies');
        
        if (book){
            return res.status(200).json(book)
        }
        return res.status(400).json({msg:'No se encontraron libros'});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })
    }
}

const biblioUserBookPost = async(req,res=response)=>{
    try {
        let username = req.params.user;

        let {mybooks} = await User.findOne({username});
    
        if (mybooks){
            let books=[];
            mybooks.forEach((book) => {
                let {bookId,biblio} = book;
                if(biblio){
                    books.push({_id:bookId})
                }
            });
            return res.status(200).json(books)
        }
    
        return res.status(400).json({msg:'No se encontraron libros'}); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })
    }

    
} 

const favUserBookPost = async(req,res= response) =>{
    try {
        let username = req.params.user;
        
        let {mybooks} = await User.findOne({username});
    
        if (mybooks){
            let books=[];
            mybooks.forEach((book) => {

                let {bookId,favorite} = book;

                if(favorite){
                    books.push({_id:bookId})
                }

            });
            return res.status(200).json(books)
        }
    
        return res.status(400).json({msg:'No se encontraron libros'}); 

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })
    }
}

const fotoIdGet = async(req,res= response)=>{
    try {
        let _id = req.params.id;
        let {imgName} = await Books.findById({_id});
        if(imgName){
            res.setHeader('Content-type', 'image/png');
            let data;
            try{
                let dir = path.join(__dirname,`../${imgName}`);
                data =fs.readFileSync(dir);
            }catch(e){
                console.log(e);
            }
            return res.send(data);
        }
        return res.status(400).json({msg:'No se encontraron libros'}); 

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })
    }
}

module.exports={
    rootBookPost,
    allBookPost,
    idAllBookPost,
    biblioUserBookPost,
    favUserBookPost,
    fotoIdGet
}