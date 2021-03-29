const {User,Books} = require('../models/schemaBook');

const existUser = async( username ) => {

    // Verifica si el username existe
    const user = await User.findOne({username});
    if ( !user ) {
        throw new Error(`El user no existe ${ username }`);
    }
}
const existBookId = async( id ) => {

    // Verifica si el username existe
    const book = await Books.findById({'_id':id})
    if ( !book ) {
        throw new Error(`El id no existe ${ id }`);
    }
}

module.exports = {
    existUser,
    existBookId
}

