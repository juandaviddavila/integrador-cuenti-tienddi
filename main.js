/*
 * Api rest de tienddi
 */

/* This should be on top because can break the imports made before the config */
const envVars = require('dotenv');
const autenticacion = require('./src/autenticacion/index');
envVars.config();
//https://docs.google.com/document/d/1aaNSHuCdT65Regw8zHaJSSm7PKDnH4pmHJ4xyFSycJI/edit
/* Import External libraries */

const express = require('express');
const cors = require('cors');
const app = express();
var jwt = require('jsonwebtoken');
const { Base64 } = require('js-base64');
//ul base
const baseUrl = '/api/v1';
global.baseUrl = baseUrl;



//app.use(formidable());
app.use(cors());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.listen(process.env.puerto, () => {
    console.log('Servidor iniciado en el puerto ' + process.env.puerto);
});


// Importamos middleware
const middleware_liviano = autenticacion.middleware_liviano;

// ruta de inicio
app.get(baseUrl + '/', function (req, res) {
    res.json('home');
    //  console.log(req.params);
    console.log("home " + req.query.variable + " " + new Date());
});

//test2();
module.exports = app;
//inicializador de modulos
require('./src/config/index');



//http://localhost:31811/api_node/v1/reportes/vencimientos_lotes?data=MTszOTA2OzE7SnVhbiBEw6F2aWxhJm1hcztwcmluY2lwYWw=
//http://localhost:31811/api_node/v1/reportes/consultarProductosStockMinimo?data=MTszOTA2OzU7MTtKdWFuIETDoXZpbGEmbWFzO3ByaW5jaXBhbA==
