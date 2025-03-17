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
        if(req.params.clave!=="jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="){

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
// Exportamos las funciones en un objeto
module.exports = router;
