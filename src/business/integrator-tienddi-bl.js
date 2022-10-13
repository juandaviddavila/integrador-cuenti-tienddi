const fs = require("fs");
const moment = require('moment');
const { setUncaughtExceptionCaptureCallback } = require("process");
const objGestorBd = require('../helpers/gestorBd');
const objGestorSQL = require('../helpers/gestorSQL');
const axios = require('axios');
const fileManager = require('utilities_cuenti/vendor/fileManager');
let $ = {};

$.get_imagen_base64 = async function (url) {
    console.log(url);
    console.log("inicio get_imagen_base64");
    try {
        var config = {
            method: 'get',
            timeout: 1000 * 20, // Wait for 5 seconds
            url: url,
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'application/pdf'
            }
        };
        const resp = await axios(config);
        let r = fileManager.fileToBase64({ content: resp.data });
        //let inner_html = resp.data;
        console.log("fin printDocumentPdfUrl");
        return r;
    } catch (err) {
        console.log("fin con error get_imagen_base64");
        // Handle Error Here
        console.error(err);
        try {
        } catch (error) { }
        throw err;
    }
};
$.get_data_imagen = async (id_company, id_producto, imagen_base64, rows_imagen) => {
    let conn = null;
    let row = null;
    try {
        if(id_producto==3609){
            console.log(1);
        }
        if (rows_imagen !== null) {
            row=[];
            //ya tengo todo local
            for (let i = 0; i < rows_imagen.length; i++) {
                if(rows_imagen[i].id_externo==id_producto){
                    row=[rows_imagen[i]];
                    break;
                }
            }
        } else {
            //llamo a la bd
            conn = await objGestorBd.getConnectionEmpresa(id_company);
            //validar configuracion sucursal para ver si aplico impuestos y si aplico impuestos al consumo
            let SQL = "SELECT id_imagen,ext1,ext2,numero_imagen FROM adm_imagenes WHERE id_externo=:id_externo and tipo=1;";
            let row = await conn.query2(SQL, { id_externo: id_producto });
        }
        let r = {
            ur1: '',
            ext: '',
            base64: null
        }
        if (row.length === 0) {
            return null;
        } else {
            if (row[0].ext1 === null) {
                r.url = "https://tienddi.co/s3_imagenes/" + id_company + "/imagenes/" + row[0].id_imagen + "." + row[0].ext1;
                r.ext = row[0].ext1;
            } else {
                if (row[0].ext1 === '') {
                    r.url = "https://tienddi.co/s3_imagenes/" + id_company + "/imagenes/" + row[0].id_imagen + "." + row[0].ext1;
                    r.ext = row[0].ext1;
                } else {
                    r.url = "https://tienddi.co/s3_imagenes/" + id_company + "/imagenes/" + row[0].id_imagen + "-400." + row[0].ext2;
                    r.ext = row[0].ext2;
                }
            }
        }
        if (r === null) {
            return await null;
        } else {
            //bajar base64 de la imagen
            if (imagen_base64) {
                r.base64 = await $.get_imagen_base64(r.url);
            }
            return await r;
        }
        //http://localhost:8084/jServerj4ErpPro/com/j4ErpPro/server/adm/imagenes/consultarImagenUrl/1/21
    } catch (error) {
        console.error(error);
        return null;
    } finally {
        if (conn !== null) {
            console.log("cierre conexion " + conn.threadId);
            // conn.end();
            conn.release(); //release to pool
        }
    };
};
$.get_data_products = async (id_company, data) => {
    let conn = null;
    let errorBd = false;
    let rows_sucursal = null;
    let rows = null;
    let rows_categoria = null;
    let rows_imagen = null;
    try {
        conn = await objGestorBd.getConnectionEmpresa(id_company);
        //validar configuracion sucursal para ver si aplico impuestos y si aplico impuestos al consumo
        let SQLSucursal = objGestorSQL.getSqlNombre("integrador_tienddi", "config_sucursal");
        rows_sucursal = await conn.query2(SQLSucursal, { id_sucursal: data.id_branch });

        let SQL = objGestorSQL.getSqlNombre("integrador_tienddi", "list_product_tienddi");
        rows = await conn.query2(SQL, { id_sucursal: data.id_branch, desde: data.from, hasta: data.limit });

        let SQlCategoria = objGestorSQL.getSqlNombre("integrador_tienddi", "list_categorias");
        rows_categoria = await conn.query2(SQlCategoria, {});

        //bajarnos lista de imagenes
        SQL = 'SELECT id_imagen,ext1,ext2,numero_imagen,id_externo FROM adm_imagenes WHERE tipo=1 GROUP BY id_externo ;';
        rows_imagen = await conn.query2(SQL, {});

        //http://localhost:8084/jServerj4ErpPro/com/j4ErpPro/server/adm/imagenes/consultarImagenUrl/1/21
    } catch (error) {
        console.error(error);
        errorBd = true;
        throw error;
    } finally {
        if (conn !== null) {
            console.log("cierre conexion " + conn.threadId);
            // conn.end();
            conn.release(); //release to pool
        }
    }

    if (errorBd) {
        return [];
    }
    rows_sucursal = rows_sucursal[0];
    rows_sucursal.vender_con_impuestos = parseInt(rows_sucursal.vender_con_impuestos);
    rows_sucursal.vender_impuestos_agregado = parseInt(rows_sucursal.vender_impuestos_agregado);
    rows_sucursal.activar_venta_compra_licores = parseInt(rows_sucursal.activar_venta_compra_licores);
    rows_sucursal.vender_ip_estampilla = parseInt(rows_sucursal.vender_ip_estampilla);
    let lst = [];
    for (const row of rows) {
        let aux_imagen = null;
        aux_imagen = await $.get_data_imagen(id_company, row.id_producto, data.imagen_base64, rows_imagen);
        let url_imagen = null;
        let url_base64 = null;
        if (aux_imagen !== null) {
            url_imagen = aux_imagen.url;
            url_base64 = aux_imagen.base64;
        }
        row.precio_venta_online = parseFloat(row.precio_venta_online);
        row.precio_venta = parseFloat(row.precio_venta);
        row.valor_impuesto = parseFloat(row.valor_impuesto);
        row.total_impoconsumo = parseFloat(row.total_impoconsumo);
        row.total_estampilla = parseFloat(row.total_estampilla);

        //calcular precio unitario
        row.precio_venta_online = row.precio_venta_online === null ? 0 : row.precio_venta_online;

        if (row.precio_venta_online === 0 && row.precio_venta > 0) {
            row.precio_venta_online = row.precio_venta;
            if (row.valor_impuesto > 0) {
                //agregar impuesto ya que precio_venta_online es con impuestos incluidos
                row.precio_venta_online == row.precio_venta_online + row.precio_venta_online * (row.valor_impuesto / 100);
            }
        }
        //al precio  row.precio_venta_online quitarle la parte que es de impuestos
        if (row.valor_impuesto > 0) {
            var auxImpuesto = (row.valor_impuesto / 100) + 1;
            row.precio_venta_online = row.precio_venta_online / auxImpuesto;
        }
        //calcular total con iva
        if (!(rows_sucursal.activar_venta_compra_licores === 1 && rows_sucursal.vender_ip_estampilla === 1)) {
            row.total_impoconsumo = 0;
            row.total_estampilla = 0;
        }
        //calcular impuestos
        //si tengo configurado no vender con impuestos entonces pongo valor en 0
        if (rows_sucursal.vender_con_impuestos === 0 && rows_sucursal.vender_impuestos_agregado === 0) {
            row.valor_impuesto = 0;
            row.total_impoconsumo = 0;
            row.total_estampilla = 0;
        }
        let total_impuestos_tax = 0;
        let total_price = row.precio_venta_online;
        if (row.valor_impuesto > 0) {
            total_price = row.precio_venta_online + row.precio_venta_online * (row.valor_impuesto / 100);
            total_impuestos_tax = total_price - row.precio_venta_online;
        }
        total_price = total_price + row.total_impoconsumo + row.total_estampilla;
        //sino vendo con impuestos pero los agrego
        if (rows_sucursal.vender_con_impuestos === 0 && rows_sucursal.vender_impuestos_agregado === 1) {
            total_impuestos_tax = 0;
            row.valor_impuesto = 0;
            row.total_impoconsumo = 0;
            row.total_estampilla = 0;
            row.precio_venta_online = total_price;
        }
        let name_category = '';
        let name_subcategory = null;
        //organizar categorias
        //si la categoria actual no tiene padre entonces category es nombre_categoria
        for (let i = 0; i < rows_categoria.length; i++) {
            if (rows_categoria[i].id_categoria === row.id_categoria) {
                if (rows_categoria[i].id_categoria_padre === null) {
                    //no es una subcategoria
                    name_category = rows_categoria[i].nombre_categoria;
                } else {
                    //es una subcategoria
                    name_subcategory = rows_categoria[i].nombre_categoria;
                    //buscar nombre del padre
                    for (let j = 0; j < rows_categoria.length; j++) {
                        if (rows_categoria[j].id_categoria === rows_categoria[i].id_categoria_padre) {
                            name_category = rows_categoria[j].nombre_categoria;
                            break;
                        }
                    }
                }
                break;
            }
        }
        let obj = {
            id_product: row.id_producto,//id de producto
            name: row.nombre,//nombre producto
            sku: row.sku,
            barcode: row.codigo_barras,
            stock: row.existencias,//existencias
            brand: row.nombre_marca,//marca
            unit_price: row.precio_venta_online,//precio unitario sin impuestos
            total_price: total_price,//precio total con impuestos +estampilla+ impuestos al consumo departamental
            tax: row.valor_impuesto,//porcentaje de impuestos
            name_tax: row.nombre_impuesto,//name tax
            tax_value: total_impuestos_tax,//valor total de impuestos segun tax
            departmental_consumption_tax: row.total_impoconsumo,//valor de impuestos de licores
            stamp_tax: row.total_estampilla,//valor de impuesto de estanpillas
            id_branch: data.id_branch,//id de sucursal
            name_branch: rows_sucursal.nombre_sucursal,//nombre de sucursal
            catalog: data.catalog,
            category: name_category,//nombre categoria
            subcategory: name_subcategory,//nombre subcategoria
            supplier: row.nombre_proveedor,//nombre proveedor
            identification_number_supplier: row.identificacion_proveedor,//identificacion de proveedor
            unit_measurement: row.unidad_medida,//unidadad de medida
            note: row.nota,//nota del producto o descripcion
            code_health_registration: row.invima,//codigo invima o registro sanitario
            inventory_control: row.controla_inventario_tienda_linea === 1 ? true : false,//realiza control de inventario si es true no dejar vendar sin existenacia y si es false dejar vender sin existencias
            is_service: row.es_servicio === 1 ? true : false,//true es un servicio/ false es un producto de inventario
            url_imagen: url_imagen,
            base64_imagen: url_base64
        }
        //configuaracion compuestos
        lst.push(obj);
    }
    return lst;
};

$.get_category = async (id_company) => {
    let conn = null;
    try {
        conn = await objGestorBd.getConnectionEmpresa(id_company);
       
        let SQlCategoria = objGestorSQL.getSqlNombre("integrador_tienddi", "list_categorias");
       return await conn.query2(SQlCategoria, {});
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
$.get_url_store_cuenti= async (id_company,data) => {
    let conn = null;
    try {
        console.log("traer conexion");
        conn = await objGestorBd.getPool_bases();
        let SQL = objGestorSQL.getSqlNombre("integrador_tienddi", "get_url_tienddi");
        const rows = await conn.query2(SQL,{id_company:id_company,id_branch:data.id_branch});
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
// Exportamos
module.exports = $;
