const express =  require('express');
const cors = require('cors');
const { dbConection } = require('../database/config');
const fileUpload = require('express-fileupload');

class Server{
    constructor(){
        this.app = express();
        this.port = process.env.PORT; 

        this.path = {
            users:'/users',
            auth:'/auth',
            books:'/books'
        }

        this.connectDB();

        this.middlewares();

        this.routes()

    }
    async connectDB(){
        await dbConection();
    }
    middlewares(){
        this.app.use(cors());

        this.app.use(express.json());

        this.app.use(express.static('public'));

        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/'
        }));
    }
    routes(){
        this.app.use(this.path.users, require('../Routes/users'));
        //this.app.use(this.path.auth, require('../Routes/auth'));
        this.app.use(this.path.books,require('../Routes/books'));


        this.app.get("/",(req,res) =>{
            res.status(200).send({Hola:'Que miras?'})
        });
    }
    listen(){
        this.app.listen(this.port, ()=>{
            console.log('Node app is running on port', process.env.PORT,new Date());
        })
    }

}
module.exports=Server