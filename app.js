const express =  require('express');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const { PDFDocument } = require('pdf-lib');
const pdf2img = require('pdf-img-convert');
const fs = require("fs-extra");
const app = express();
const Route = require('./route/Routes');
const {User,Books} = require('./models/schemaBook');

require('dotenv').config();

app.use(fileUpload())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use('/users', Route.users);
app.use('/books', Route.Books);

app.set('port', (process.env.PORT || 4000));
app.set("view engine","jade");

const users_guess=[];

app.get("/",(req,res) =>{
    /*let user = new User({
        username:'AgustLuj',
        pass:'1234',
    })
    user.save((err,result)=>{
        if(result != null){
            //res.status(200).send(result);
        }
    })
    let book = new Books({
        name:'Libertad Libertad Libertad',
        author:'Javier Milei',
        path:'/books/javier.pdf',
        pages:442,
    });
    book.save((err,result)=>{
        if(result != null){
            res.status(200).send(result);
        }
    })
    Books.find({},(err,result)=>{
        res.status(200).send(result);

    })*/
    res.status(200).send({Hola:'Que miras?'})

});
app.get("/addBook",(req,res)=>{
    let _id = '600d1dedb5c9e41e34991b58';
    Books.findById({_id},async (err,book)=>{
        let newbook={
            bookId:_id,
        }
        await User.findById({_id:'600d1dedb5c9e41e34991b57'},(err,user)=>{
            user.mybooks.push(newbook);
            user.booksCount +=1;
            book.copies += 1;
            user.save((err,result)=>{
                if(result != null){
                    book.save((err,resultBok)=>{
                        if(resultBok != null){
                            res.status(200).send({result,resultBok});
                        }
                    })
                }
            })
        });
    })
});
let a = 0;
app.listen(app.get('port'), function() {
    var f = new Date();
    console.log('Node app is running on port', app.get('port'),f);
});
const hola = async()=>{
    let doc = await PDFDocument.create();    
    doc.addPage();
    let dir=__dirname+'/usersPdf';
    fs.writeFileSync(dir+'/test.pdf', await doc.save());
    //var data =fs.readFileSync(dir+'/test.pdf');
    //console.log("enviado")
    //res.send(data);

    
}
const pruebas = async()=>{
    let dir = __dirname+'/pdfs/';
    
    fs.readdir(dir, function(err, filenames) {
        if(err){
            console.log(err)
            return
        }
        //console.log(filenames);
        filenames.forEach( async (names)=>{
            let author = names.split('-')[0].slice(0,-1);
            let book = names.split('-')[1].slice(1,-4);

            let dir = __dirname+'/books/'+author.split(' ').join('_');
            let pathDir='/books/'+author.split(' ').join('_')+'/'+book.split(' ').join('_');

            if (!fs.existsSync(dir)){
                await fs.mkdirSync(dir);
            }
            dir = __dirname+'/books/'+author.split(' ').join('_')+'/'+book.split(' ').join('_');
            if (!fs.existsSync(dir)){
                await fs.mkdirSync(dir);
            }
            pdfArray = await pdf2img.convert(__dirname+'/pdfs/'+names,{page_numbers: [1]});
            for (i = 0; i < 1; i++){
                await fs.writeFile(dir+'/'+book.split(' ').join('_')+'.png', pdfArray[i], function (error) {
                    if (error) console.error("Error: " + error); 
                });
            }
            let bookNameChange=author.split(' ').join('_')+'_'+book.split(' ').join('_');
            let doc = await PDFDocument.load(fs.readFileSync(__dirname+'/pdfs/'+names));
            let pages = doc.getPages();

            let bookas = new Books({
                name:book,
                author,
                path:pathDir+'/'+bookNameChange+'.pdf',
                imgName:pathDir+'/'+book.split(' ').join('_')+'.png',
                pages:pages.length,
            });
            await bookas.save(async (err,result)=>{
                if(result != null){
                    console.log(result)
                    await fs.rename(__dirname+'/pdfs/'+names, __dirname+pathDir+'/'+bookNameChange+'.pdf', function(err,e) {
                        if ( err ) console.log('ERROR: ' + err);
                    });
                    return
                }
                console.log(err)
            });
            //console.log(names.split('-')[0].slice(0,-1).split(' ').join('_'))
            //console.log(author,book)
        })
    })
}
//hola();
//pruebas();