/*
 * Api rest de tienddi
 */

/* This should be on top because can break the imports made before the config */
const envVars = require('dotenv');
envVars.config();
const express = require('express');
const cors = require('cors');
const app = express();
//ul base
const baseUrl = '/api/v1';
global.baseUrl = baseUrl;
global.normalizedPath = require("path").join(__dirname, "src");
//app.use(formidable());
app.use(cors());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.listen(process.env.port, () => {
    console.log('Servidor iniciado en el puerto ' + process.env.port);
});

// ruta de inicio
app.get(baseUrl + '/', function (req, res) {
    res.json('home');
    //  console.log(req.params);
    console.log("home " + req.query.variable + " " + new Date());
});

app.get(baseUrl+'/borrar_empresa_server', function (req, res) {
    let gestorBd=require('./src/helpers/gestorBd');
    gestorBd.borrarEmpresa_server(req.query.id_empresa);

    res.json({ type: 1, message: 'enviado' });
});

//test2();
module.exports = app;
//inicializador de modulos
require('./src/config/index');



//http://localhost:31811/api_node/v1/reportes/vencimientos_lotes?data=MTszOTA2OzE7SnVhbiBEw6F2aWxhJm1hcztwcmluY2lwYWw=
//http://localhost:31811/api_node/v1/reportes/consultarProductosStockMinimo?data=MTszOTA2OzU7MTtKdWFuIETDoXZpbGEmbWFzO3ByaW5jaXBhbA==
