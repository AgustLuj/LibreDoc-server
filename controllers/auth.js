const {response,request} = require('express');
const path = require("path"); 
const fs = require("fs-extra");
const bcryptjs = require('bcryptjs');
const { PDFDocument } = require('pdf-lib');

const { User,Books } = require('../models/schemaBook');
const { createFile } = require('../helpers/createFile');
const { generateJWT } = require('../helpers/generate-jwt');
const { googleVerify } = require('../helpers/google');

const authLoginPost = async(req= request,res=response)=>{
    try {
        let {pass,username}=req.body;
        pass = pass.toString();

        let user = await User.findOne({username})
        /// COMPRUEBO QUE EXISTA EL USER
        if(!user){
            return res.status(400).json({
                "msg":'El user o la contraseña es incorrecta'
            })
        }
        /// COMPARO PASS
        const passCompare = bcryptjs.compareSync(pass,user.pass);
        if(!passCompare){
            return res.status(400).json({
                "msg":'El correo o la contraseña es incorrecta'
            })
        }
        /// GENERO EL TOKEN
        const token = await generateJWT(user._id);
        /// ENVIO EL TOKEN
        return res.status(200).json({login:true,token});

    } catch (error) {
        console.trace(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })
    }
}

const authRegisterPost = async(req,res=response)=>{
    try {
        
        let {pass,username}=req.body;
        pass = pass.toString();
        
        let dir ='/books/users/'+username+'/'+username+'.pdf';
        let user = new User({
            username,
            pass,
            path:dir,
        })
        const salt = bcryptjs.genSaltSync();
        user.pass = bcryptjs.hashSync( pass, salt );

        let save = await user.save();

        if(save){
            let file = await createFile(username);
            
            if(file){
                let dirfull = path.join(__dirname,`..${dir}`);
                
                let doc = await PDFDocument.create();    

                doc.addPage();

                fs.writeFileSync(dirfull, await doc.save());

                const token = await generateJWT(user._id);

                return res.status(200).json({username,token});
            }
            return res.status(400).json({'msg':'No se pudo completar el registro'}); 
        }
        return res.status(400).json({'msg':'No se pudo completar el registro'}); 
        

    } catch (error) {
        console.trace(error);
        return res.status(500).json({
            msg:'Error Desconocido, contactar con el admin'
        })  
    }
}
const authGooglePost = async(req,res)=>{
    const {idToken} =req.body;
    //console.log(idToken);
    try {

        const {email} = await googleVerify(idToken);
        username = email.split('@')[0];
        let user = await User.findOne({username});
        if(!user){
            
            let dir ='/books/users/'+username+'/'+username+'.pdf';
            user  = new User({
                username:username,
                pass:':$',
                google:true,
                path:dir
            })

            await user.save();

            let file = await createFile(username);
            
            if(file){

                const token = await generateJWT(user._id);
                console.log(user)
                return res.status(200).json({username,token});
            }
            return res.status(400).json({'msg':'No se pudo completar el registro'}); 
        }
        //State == false
        if(!user.state){
            return res.status(400).json({
                "msg":'El usuario no existe'
            })
        }

        const token = await generateJWT(user._id);

        return res.status(200).json({username,token});
        
    } catch (error) {

        console.log(error);
        return res.status(500).json({
            msg:'Token invalido'
        });

    }


}
module.exports ={
    authLoginPost,
    authRegisterPost,
    authGooglePost
} 