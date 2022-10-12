// Cargamos el módulo de express para poder crear rutas
const { Router } = require('express');
// Llamamos al router
const router = Router();

const objIntegracion_erp = require('../bussiness/integracion_erp');

const objUtilidades = require('../vendor/fileManager');

router.post('/consultarPlanIdEmpresa', async function (req, res) {
    try {
        let r = await objIntegracion_erp.consultarPlanIdEmpresa(req.body.id_empresa);
        res.json(r);
    } catch (e) {
        console.log("error:" + e);
        res.status(500);
        res.json({ status: 500, error: e.message });
    }
});
router.post('/consultarEstadisticaEmpresa', async function (req, res) {
    try {
        let r = await objIntegracion_erp.consultarEstadisticaEmpresa(req.body.id_empresa);
        res.json(r);
    } catch (e) {
        console.log("error:" + e);
        res.status(500);
        res.json({ status: 500, error: e.message });
    }
});

router.post('/evento_creacionEmpresa', async function (req, res) {
    try {
        let r = await objIntegracion_erp.consultarEstadisticaEmpresa(req.body.id_empresa);
        r.adicional = await objIntegracion_erp.actauliazarEmpresaCrm(r);

        res.json(r);
    } catch (e) {
        console.log("error:" + e);
        res.status(500);
        res.json({ status: 500, error: e.message });
    }
});

router.post('/evento_actualizacion_empresa', async function (req, res) {
    try {
        let r = await objIntegracion_erp.consultarEstadisticaEmpresa(req.body.id_empresa);
        r.adicional = await objIntegracion_erp.actauliazarEmpresaCrm(r);

        res.json(r);
    } catch (e) {
        console.log("error:" + e);
        res.status(500);
        res.json({ status: 500, error: e.message });
    }
});
router.post('/evento_pago_automatico', async function (req, res) {
    try {
        let r = await objIntegracion_erp.consultarEstadisticaEmpresa(req.body.id_empresa);
        res.json(r);
    } catch (e) {
        console.log("error:" + e);
        res.status(500);
        res.json({ status: 500, error: e.message });
    }
});

router.post('/testBd', async function (req, res) {
    try {
        let r = await objIntegracion_erp.testBd(req.headers['x-auth-token-empresa'],req.body.es_factura_electronica);
        res.json(r);
    } catch (e) {
        console.log("error:" + e);
        res.status(500);
        res.json({ status: 500, error: e.message });
    }
});
// Exportamos las funciones en un objeto
module.exports = router;
