const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/schemaBook');


const validarJWT = async( req = request, res = response, next ) => {

    const token = req.header('x-token');

    if ( !token ) {
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {
        
        const { _id } = jwt.verify( token, process.env.SECRETPRIVATEKEY );

        // leer el usuario que corresponde al uid
        const user = await User.findById( _id );
        if(req.params.user){
            if(req.params.user != user.username){
                return res.status(401).json({
                    msg: 'Token no válido-difente'
                })
            }
        }
        if( !user ) {
            return res.status(401).json({
                msg: 'Token no válido-user'
            })
        }

        // Verificar si el uid tiene estado true
        if ( !user.state ) {
            return res.status(401).json({
                msg: 'Token no válido'
            })
        }
        
        
        req.user = user;
        next();

    } catch (error) {

        console.log(error);
        return res.status(401).json({
            msg: 'Token no válido'
        })
    }

}




module.exports = {
    validarJWT
}