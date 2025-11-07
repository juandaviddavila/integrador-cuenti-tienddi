/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var { Router } = require('express');
//var ClavesUsuario = require('../configs/ClavesUsuario');
//var config = require('../configs/config');
var jwt = require('jsonwebtoken');
const { Base64 } = require('js-base64');
const middleware = Router();
const axios = require('axios');
middleware.use(async function (req, res, next) {
    if (req.path.indexOf("webhook_parking") >= 0) {
        const parts = req.originalUrl.split('/');
        const id = parts[5]; // índice 5 -> /api(0) v1(1) integration(2) webhook_parking(3) 8765(4) 1(5) 1(6)
        console.log(id); // 8765
        req.headers['id-company'] = id;
    }
    try {
        var config = {
            method: 'post',
            url: 'https://generate-token-cuenti.cuenti.co/ensureAuthenticated',
            headers: {
                'Content-Type': 'application/json',
                'authorization': req.headers.authorization,
                'x-auth-token-empresa': req.headers['id-company']
            }
        };
        const resp = await axios(config);
        // console.log(resp.data);
        if (resp.data.mensaje === 'Autenticación correcta') {
            next();
        } else {
            res.status(404);
            return res.json({ mensaje: 'Token inválida' });
        }
    } catch (err) {
        // Handle Error Here
        console.error(err);
        res.status(404);
        return res.json({ mensaje: 'Token inválida' });
    }
});

// Exportamos la configuración
module.exports = middleware;
