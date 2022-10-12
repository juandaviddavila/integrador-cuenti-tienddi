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
const axios = require('axios').default;
middleware.use(async function (req, res, next) {
    if (req.headers.authorization !== undefined) {
        try {
            var config = {
                method: 'post',
                url: 'https://generate-token-cuenti.cuenti.co/ensureAuthenticated',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': req.headers.authorization,
                    'x-auth-token-empresa': req.headers['x-auth-token-empresa']
                }
            };
            const resp = await axios(config);
            // console.log(resp.data);
            if (resp.data.mensaje === 'Autenticación correcta') {
                next();
            } else {
                res.status(203);
                return res.json({ mensaje: 'Token inválida' });
            }
        } catch (err) {
            // Handle Error Here
            console.error(err);
            res.status(203);
            return res.json({ mensaje: 'Token inválida' });
        }
    } else {
        var token = req.headers['access-token'];
        if (token) {
            token = Base64.decode(token);
            jwt.verify(token, process.env.token_liviano, (err, decoded) => {
                if (err) {
                    res.status(203);
                    return res.json({ mensaje: 'Token inválida' });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(203);
            res.send({
                mensaje: 'Token no proveída.'
            });
        }
    }
});

// Exportamos la configuración
module.exports = middleware;
