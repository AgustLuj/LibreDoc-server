const express =  require('express');

class Server{
    constructor(){
        this.app = express();
        this.port = process.env.PORT; 
        this.routes()
    }
    routes(){
        this.app.get("/",(req,res) =>{
            res.status(200).send({Hola:'Que miras?'})
        });
    }
    listen(){
        this.app.listen(this.port, ()=>{
            console.log('Server Creado con class',this.port);
        })
    }

}
module.exports=Server