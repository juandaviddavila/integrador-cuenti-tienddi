// Cargamos el módulo de express para poder crear rutas
const { Router } = require('express');
// Llamamos al router
const router = Router();
let fileManager = require('utilities_cuenti/vendor/fileManager');

const objIntegratorTienddiBl = require('../business/integrator-tienddi-bl');

router.post('/get_url_store_cuenti', async function (req, res) {
    try {
        let r = await objIntegratorTienddiBl.get_url_store_cuenti(req.headers['id-company'],req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
// Exportamos las funciones en un objeto
module.exports = router;
