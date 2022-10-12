const fs = require("fs");
const moment = require('moment');
const objGestorBd = require('../config/gestorBd');
const objGestorSQL = require('../config/gestorSQL');
const axios = require('axios').default;

let integracion_erp = function () {
    var j4 = {};

    j4.actauliazarEmpresaCrm = async function (data) {
        try {
            let plan_cuenti = '';
            let fecha_vencimiento_demo = '';
            let fecha_vencimiento_plan = '';
            if (data.estadisticas.length > 0) {
                plan_cuenti = data.estadisticas[0].plan_cuenti;
                fecha_vencimiento_demo = data.estadisticas[0].fecha_vencimiento_demo;
                fecha_vencimiento_plan = data.estadisticas[0].fecha_vencimiento_plan;
            }
            data.empresa= data.empresa[0];
            let codigo_whatsapp = '57';
            try {
                if (data.empresa.telefono !== null) {
                    let split = data.empresa.telefono.split(";");
                    data.empresa.telefono = split[0].split("+")[1];
                    codigo_whatsapp = split[0].split("+")[0];
                }
            } catch (error) {

            }
            var config = {
                method: 'post',
                url: 'http://54.188.108.158:3001/contact',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "idempresa": data.empresa.id_empresa,
                    "nombre_empresa": data.empresa.nombre_empresa,
                    "email": data.empresa.email_documentos,
                    "nombre": data.empresa.contacto,
                    "tipo_negocio": data.empresa.nombre_sector_empresa,
                    "celular": data.empresa.telefono,
                    "codigo_whatsapp": codigo_whatsapp,
                    "pais": data.empresa.pais,
                    "ciudad": data.empresa.ciudad,
                    "plan_cuenti": plan_cuenti,
                    "fecha_vencimiento_demo": fecha_vencimiento_demo,
                    "fecha_vencimiento_plan": fecha_vencimiento_plan,
                    completo:data
                }
            };
            const resp = await axios(config);
            console.log("Envio id_empresa:"+data.empresa.id_empresa+" al crm");
            return resp.data;
        } catch (err) {
            console.log(err.message);
            return null;
        }
    };
    /**
       * @method
       * @desc Metodo que valida si documento electronico es valido en la dian
       */
    j4.consultarPlanIdEmpresa = async function (id_empresa) {
        let conn = null;
        try {
            console.log("traer conexion");
            conn = await objGestorBd.getPool_bases();
            let SQL = objGestorSQL.getSqlNombre("consultas", "consultarPlanIdEmpresa");
            const rows = await conn.query2(SQL, { id_empresa: id_empresa });
            return rows;
        } catch (err) {
            console.log("error:" + err);
            throw err;
        } finally {
            if (conn !== null) {
                console.log("cierre conexion " + conn.threadId);
                conn.end();//cerrar conexion y regresarlo
            }
        }
    };
    j4.consultarEstadisticaEmpresa = async function (id_empresa) {
        let conn = null;
        try {
            console.log("traer conexion");
            conn = await objGestorBd.getPool_bases();
            let SQL = objGestorSQL.getSqlNombre("consultas", "consultarEstadisticaEmpresa");
            let dataRetorno = {
                estadisticas: null,
                empresa: null
            }
            let rows = await conn.query2(SQL, { id_empresa: id_empresa });
            dataRetorno.estadisticas = rows;
            SQL = objGestorSQL.getSqlNombre("consultas", "dataEmpresa");
            rows = await conn.query2(SQL, { id_empresa: id_empresa });
            dataRetorno.empresa = rows;
            return dataRetorno;
        } catch (err) {
            console.log("error:" + err);
            throw err;
        } finally {
            if (conn !== null) {
                console.log("cierre conexion " + conn.threadId);
                conn.end();//cerrar conexion y regresarlo
            }
        }
    };

    j4.testBd = async function (id_empresa,es_factura_electronica) {
        let conn = null;
        try {
            conn = await objGestorBd.getConnectionEmpresa(id_empresa);
            let SQL = objGestorSQL.getSqlNombre("consultas", "lista_consecutivo");
            return await conn.query2(SQL, { es_factura_electronica: es_factura_electronica });
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            if (conn !== null) {
                console.log("cierre conexion " + conn.threadId);
                // conn.end();
                conn.release(); //release to pool
            }
        }
    };
    return {
        j4: j4
    };
}();
// Exportamos las funciones en un objeto
module.exports = integracion_erp.j4;
