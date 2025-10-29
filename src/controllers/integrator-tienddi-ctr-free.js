// Cargamos el módulo de express para poder crear rutas
const { Router } = require('express');
// Llamamos al router
const router = Router();
let fileManager = require('utilities_cuenti/vendor/fileManager');

const objIntegratorTienddiBl = require('../business/integrator-tienddi-bl');

router.post('/get_url_store_cuenti', async function (req, res) {
    try {
        let r = await objIntegratorTienddiBl.get_url_store_cuenti(req.headers['id-company'], req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});


function diferenciaMayorASeisMeses(fecha1, fecha2) {
    // Convertir las cadenas de fecha en objetos Date
    const fechaInicio = new Date(fecha1);
    const fechaFin = new Date(fecha2);

    // Calcular la diferencia en meses
    const añosDiferencia = fechaFin.getFullYear() - fechaInicio.getFullYear();
    const mesesDiferencia = fechaFin.getMonth() - fechaInicio.getMonth();
    const diferenciaTotalMeses = añosDiferencia * 12 + mesesDiferencia;

    // Verificar si la diferencia es mayor a 6 meses
    return diferenciaTotalMeses > 6;
}
router.get('/getMetricas/:id_company/:fecha1/:fecha2/:clave', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {

            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        req.params.fecha1 = req.params.fecha1 + ' 00:00:00';
        req.params.fecha2 = req.params.fecha2 + ' 23:59:59';
        if (diferenciaMayorASeisMeses(req.params.fecha1, req.params.fecha2)) {
            res.json({
                type: 0,
                message: 'La diferencia entre las fechas es mayor a seis meses',
            })
        }
        let r = await objIntegratorTienddiBl.getMetricas(req.params.id_company, req.params);
        let data = fileManager.base64ToFile(r);
        if (r === null) {
            res.json(r);
            return;
        }
        //  var data = fs.readFileSync(name_file);
        res.contentType("application/xlsx");
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=informe_ventas_" + req.params.id_company + ".xlsx");

        res.send(data.content);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});

router.get('/getMetricas_producto/:id_company/:id_sucursal/:id_producto/:meses_antes/:export_excel/:clave', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {

            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        if (req.params.meses_antes > 12) {
            res.json({
                type: 0,
                message: 'La diferencia entre las fechas es mayor a 12 meses',
            })
        }
        let r = await objIntegratorTienddiBl.getMetricas_producto(req.params.id_company, req.params);
        if (req.params.export_excel == 1) {
            let data = fileManager.base64ToFile(r);
            if (r === null) {
                res.json(r);
                return;
            }
            //  var data = fs.readFileSync(name_file);
            res.contentType("application/xlsx");
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=informe_ventas_" + req.params.id_company + ".xlsx");

            res.send(data.content);
        } else {
            res.json(r);
        }
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});


router.post('/createPaymentLink/:clave', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {
            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        let r = await objIntegratorTienddiBl.createPaymentLink(req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/getPaymentLink/:clave', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {
            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        let r = await objIntegratorTienddiBl.getPaymentLink(req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/deletePaymentLink/:clave', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {
            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        let r = await objIntegratorTienddiBl.deletePaymentLink(req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/getConfigurations/:clave', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {
            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        let r = await objIntegratorTienddiBl.getConfigurations(req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/activarPagos/:clave', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {
            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        let r = await objIntegratorTienddiBl.activarPagos(req.body);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.post('/webhookCuentiPay/:codigo', async function (req, res) {
    try {
        let r = await objIntegratorTienddiBl.webhookCuentiPay(req.body, req.params.codigo);
        if (r.type == 1) {
            res.json(r);
        } else {
            res.status(500);
            res.json({ status: 500, error: r.message });
        }
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
router.get('/get_conf_modulos_sucursal/:clave/:id_company/:id_sucursal', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {
            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        let r = await objIntegratorTienddiBl.get_conf_modulos_sucursal(req.params.id_company, req.params.id_sucursal);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});

router.get('/get_conf_modulos_sucursal_generarQr_url_dian/:clave/:id_company/:id_sucursal', async function (req, res) {
    try {
        if (req.params.clave !== "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434===") {
            res.json({
                type: 0,
                message: 'clave mala',
            })
        }
        let r = await objIntegratorTienddiBl.get_conf_modulos_sucursal_generarQr_url_dian(req.params.id_company, req.params.id_sucursal);
        res.json(r);
    } catch (e) {
        fileManager.managerErrorApi(res, e);
    }
});
// Exportamos las funciones en un objeto
module.exports = router;
