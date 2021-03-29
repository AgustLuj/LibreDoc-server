const mongoose = require('mongoose');

const dbConection = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_CNN,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex:true,
            useFindAndModify:false
        })
        console.log('Coneccion a base de datos establecida')
    } catch (error) {
        console.log(error)
        throw new Error('Error al conectar a la base de datos')
    }
}
module.exports = {
    dbConection
}