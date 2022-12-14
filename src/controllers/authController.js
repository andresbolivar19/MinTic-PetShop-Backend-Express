const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require("bcrypt");


// Funcion Login sin guardado de usuario
// function login (req, res) {
//     const user = {
//         username: "AFBN",
//         email: "a@gmail.com"
//     }
//     // Al consultar la ruta envia el usuario 
//     // res.send({
//     //     loginUser: user
//     // });

//     // Guarda el objeto user y genera el token 
//     jwt.sign( user, 'secretKey', (err, token ) => {
//         res.send({
//             token: token
//         });          
//     } );
// }

async function login(req, res) {

    const user = await User.findOne({
        email: req.body.email
    });

    if ( user == null ){
        res.status(403).send({ message: "Invalid credentials"});    
        return;
    }else{

        const validPassword = await bcrypt.compare( req.body.password, user.password );
        
        if( !validPassword ){
            res.status(403).send({ message: "Invalid password"});
            return;
        }else{

        let token = await new Promise((resolve, reject) => {
        
            jwt.sign( user.toJSON(), 'secretKey',{ expiresIn: '3600s'} ,(err, token) => {
                if (err){
                    reject(err);
                } else{
                    resolve(token);
                }
            });
        });
        
        res.status(200).send({ message:"Authentication successful", token: token });    
        return;
    }
}
}

function profile(req, res) {

    res.status(200).send({
        message: req.payload
    });

}

// Function called before acces the route
// next: to continue with proccess
function verifyToken(req, res, next) {
    // Verifica en los headers el valor que tiene en authorization
    const requestHeader = req.headers['authorization'];

    // Valida si se envio o no el header authorization
    if (typeof requestHeader !== 'undefined') {
        // funcion split separa un texto segun el separador que se ponga, en este caso espacio
        const token = requestHeader.split(" ")[1];

        // Validacion del token, el usuario se guarda arriba en jwt.sign( user,
        jwt.verify(token, 'secretKey', (err, payload) => {

            if (err) {
                // Si no es el token esperado, genera error de no autorizado
                res.status(403).send({
                    error: "Token not valid"
                });
            } else {
                req.payload = payload;
                next();
            }
        });

    } else {
        //2 formas de enviar el estado 403
        res.status(403).send({
            error: "Token missing"
        });
        //res.status(403).send();
    }
}

module.exports = { login, profile, verifyToken };
