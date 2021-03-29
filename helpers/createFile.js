const path = require("path"); 
const fs = require("fs-extra");
const { PDFDocument } = require('pdf-lib');

const createFile= async (username)=>{
    try {
        let dir = path.join(__dirname,`../books/users/${username}`)
        if (!fs.existsSync(dir)){
            await fs.mkdirSync(dir);

            let doc = await PDFDocument.create();    
            doc.addPage();
            fs.writeFileSync(`${dir}/${username}.pdf`, await doc.save());
            return true;
        }
        return true;
    } catch (error) {
        console.log(error,username);
        throw new Error('No se pudo crear la carpeta, contactar al administrador')
    }
    
}

module.exports = {
    createFile
}