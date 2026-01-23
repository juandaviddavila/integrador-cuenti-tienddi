// Cargamos el módulo de express para poder crear rutas
const { Router } = require('express');
// Llamamos al router
const router = Router();
let fileManager = require('utilities_cuenti/vendor/fileManager');

const objIntegratorTienddiBl = require('../business/integrator-tienddi-bl');
let queue_express = require('express-queue');
router.post('/get_data_products', async function (req, res) {
    try {
        let r = await objIntegratorTienddiBl.get_data_products(req.headers['id-company'], req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/get_imagen_base64', async function (req, res) {
    try {
        let r = await objIntegratorTienddiBl.get_imagen_base64(req.body.url);
        res.json({ url: req.body.url, base64: r });
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/get_category', async function (req, res) {
    try {
        let r = await objIntegratorTienddiBl.get_category(req.headers['id-company']);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/get_url_store_cuenti', async function (req, res) {
    try {
        let r = await objIntegratorTienddiBl.get_url_store_cuenti(req.headers['id-company'], req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
router.post('/webhook_parking/:id_company/:id_sucursal/:id_empleado', queue_express({
    activeLimit: 1, queuedLimit: 30, rejectHandler: (req, res) => {
        // res.sendStatus(500);
        res.status(500);
        res.json({ status: 500, error: "Intente más tarde cola de procesamiento muy llena test" });
    }
}), async function (req, res) {
    try {
        // Espera 5 segundos
        // await delay(5000);
        let r = await objIntegratorTienddiBl.webhook_parking(req.headers['id-company'],
            req.headers['authorization'],
            req.params.id_sucursal, req.params.id_empleado, req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/buscarTransacionTag', queue_express({
    activeLimit: 1, queuedLimit: 5, rejectHandler: (req, res) => {
        // res.sendStatus(500);
        res.status(500);
        res.json({ status: 500, error: "Intente más tarde cola de procesamiento muy llena test" });
    }
}), async function (req, res) {
    try {
        let r = await objIntegratorTienddiBl.buscarTransacionTag(req.headers['id-company'], req.body.nombre);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
// Exportamos las funciones en un objeto
module.exports = router;
