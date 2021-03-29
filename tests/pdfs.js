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