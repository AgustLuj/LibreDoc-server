const express =  require('express');
const fileUpload = require('express-fileupload')
const { PDFDocument } = require('pdf-lib');
const pdf2img = require('pdf-img-convert');
const fs = require("fs-extra");
const app = express();
const Route = require('./route/Routes');
const {User,Books} = require('./models/schemaBook');

require('dotenv').config();

app.use(fileUpload())
app.use(express.static('public'));
app.use('/users', Route.users);
app.use('/books', Route.Books);

app.set('port', (process.env.PORT || 4000));

const users_guess=[];

app.get("/",(req,res) =>{
    res.status(200).send({Hola:'Que miras?'})
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'),new Date());
});