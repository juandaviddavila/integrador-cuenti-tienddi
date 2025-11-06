const fs = require("fs");
const moment = require('moment');
const { setUncaughtExceptionCaptureCallback } = require("process");
const objGestorBd = require('../helpers/gestorBd');
const objGestorSQL = require('../helpers/gestorSQL');
const axios = require('axios');
const fileManager = require('utilities_cuenti/vendor/fileManager');
let $ = {};

let redondeo = function (numero, decimales) {
    var flotante = parseFloat(numero);
    var resultado = Math.round(flotante * Math.pow(10, decimales)) / Math.pow(10, decimales);
    return resultado;
};

let redondearDecimalesEspecial = function (numero, decimales) {
    numeroRegexp = new RegExp('\\d\\.(\\d){' + decimales + ',}');   // Expresion regular para numeros con un cierto numero de decimales o mas
    if (numeroRegexp.test(numero)) {         // Ya que el numero tiene el numero de decimales requeridos o mas, se realiza el redondeo
        return Number(numero.toFixed(decimales));
    } else {
        return Number(numero.toFixed(decimales)) === 0 ? 0 : numero;  // En valores muy bajos, se comprueba si el numero es 0 (con el redondeo deseado), si no lo es se devuelve el numero otra vez.
    }
};
let RoundHalfDown = function (num) {
    return -Math.round(-num);
}
let reondeoCentimos = function (valor, digitos, es_decimal, cantidad_decimales) {
    if (!es_decimal) {
        let e = Math.pow(10, digitos);
        let v = valor / e;
        let v1 = RoundHalfDown(v);
        let r = v1 * e;
        r = parseFloat(r);
        if (isNaN(r)) {
            r = 0;
        }
        return r;
    } else {
        //preferiblemente  cantidad_decimales=2 y digitos=1
        let parte_decimal = valor % 1;
        parte_decimal = Math.round(parseFloat(parte_decimal) * Math.pow(10, cantidad_decimales));
        if (parte_decimal === 0) {
            return reondeoCentimos(valor, digitos, false, cantidad_decimales);
        }
        let e = Math.pow(10, digitos);
        let v = parte_decimal / e;
        let v1 = RoundHalfDown(v);
        v1 = v1 * e;
        let v2 = parseFloat(Math.trunc(valor) + "." + v1.toString());
        let r = v2;
        r = parseFloat(r);
        if (isNaN(r)) {
            r = 0;
        }
        return r;
    }
};
let ajusteDinero = function (valor) {
    return reondeoCentimos(valor, 0, false, 0);
};
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
        if (id_producto == 3609) {
            console.log(1);
        }
        if (rows_imagen !== null) {
            row = [];
            //ya tengo todo local
            for (let i = 0; i < rows_imagen.length; i++) {
                if (rows_imagen[i].id_externo == id_producto) {
                    row = [rows_imagen[i]];
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

$.get_data_compound = async (id_company, data, id_producto, rows_sucursal, rows_categoria, rows_imagen) => {
    let conn = null;
    let errorBd = false;
    let rows = null;
    try {
        conn = await objGestorBd.getConnectionEmpresa(id_company);
        let SQL = objGestorSQL.getSqlNombre("integrador_tienddi", "list_compuesto");
        rows = await conn.query2(SQL, { id_producto: id_producto });
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
    let lst = [];
    let _data = fileManager.copyObject(data);
    _data.imagen_base64 = false;
    for (const row of rows) {
        //voy a optener data full del compuesto
        let product = await $.get_data_product_id(id_company, data, row.id_producto, rows_sucursal, rows_categoria, rows_imagen);
        lst.push({
            product: product,
            quantity: redondeo(parseFloat(row.unidades), 2) < 0 ? 0 : redondeo(parseFloat(row.unidades), 2),//validar
            id_product: row.id_producto,
            id_product_compound: row.id_producto_compuesto
        });
    }
    return lst;
};

$.get_data_product_id = async (id_company, data, id_producto, rows_sucursal, rows_categoria, rows_imagen) => {
    let conn = null;
    let errorBd = false;
    let rows = null;
    try {
        conn = await objGestorBd.getConnectionEmpresa(id_company);
        let SQL = objGestorSQL.getSqlNombre("integrador_tienddi", "list_product_tienddi");
        SQL = SQL.replace('{{adicional}}', 'AND p.id_producto=' + id_producto);
        SQL = SQL.replace('and p.id_producto=881', '');
        SQL = SQL.replace('es_ingrediente=0 AND', '');
        SQL = SQL.replace('LIMIT :desde,:total', '');
        rows = await conn.query2(SQL, { id_sucursal: data.id_branch, desde: 0, hasta: 1 });
        console.log(1);
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
    let lst = [];
    let _data = fileManager.copyObject(data);
    _data.imagen_base64 = false;
    for (const row of rows) {
        lst.push(await $.generate_product(id_company, data, row, rows_categoria, rows_sucursal, rows_imagen, true));
    }
    return lst;
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
        SQL = SQL.replace('{{adicional}}', '');
        //paginacion
        let desde_paginacion = 0;
        let total_paginacion = 50000;
        if (data.pagina > -1) {
            //validar pagina
            if (data.pagina == 0) {
                desde_paginacion = 0;
            } else {
                desde_paginacion = data.pagina * total_paginacion;
            }
        }
        rows = await conn.query2(SQL, { id_sucursal: data.id_branch, desde: desde_paginacion, total: total_paginacion });

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
        if (row.nombre !== null) {
            if (row.nombre.length > 3) {
                lst.push(await $.generate_product(id_company, data, row, rows_categoria, rows_sucursal, rows_imagen));
            } else {
                console.log(1);
            }
        }
    }
    return lst;
};

$.generate_product = async function (id_company, data, row, rows_categoria, rows_sucursal, rows_imagen, cyclic) {
    cyclic = cyclic === undefined ? false : cyclic;//si es tru si o si es estandar y no llama a nada mas para evitar ciclicida
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
    let tax_type = 'TAX_STANDARD';
    //buscar tax_type
    switch (row.tipo_impuesto) {
        case 1:
            tax_type = 'TAX_STANDARD';
            break;
        case 2:
            tax_type = 'VALUE';
            break;
        case 3:
            tax_type = 'ICO';
            break;
    }
    //buscar TAXED
    let tax_classification = 'TAXED';
    switch (row.clasificacion_tributaria) {
        case 1:
            tax_classification = 'TAXED';
            break;
        case 2:
            tax_classification = 'EXCLUDED';
            break;
        case 3:
            tax_classification = 'EXEMPT';
            break;
    }
    let product_type = 'STANDARD';
    switch (row.id_tipo_producto) {
        case 1:
            product_type = 'STANDARD';
            break;
        case 2:
            product_type = 'COMPOUND';
            break;
    }
    if (cyclic) {
        product_type = 'STANDARD';
        row.presentaciones = null;
        row.configuracion_dinamica = null;
    }
    row.sku = row.sku === null ? row.id_producto : row.id_producto;
    row.sku = row.sku.toString().trim();
    row.sku = row.sku === '' ? row.id_producto : row.id_producto;
    let obj = {
        id_product: row.id_producto,//id de producto
        name: row.nombre,//nombre producto
        sku: row.sku.toString(),
        barcode: row.codigo_barras,
        stock: redondeo(parseFloat(row.existencias), 2) < 0 ? 0 : redondeo(parseFloat(row.existencias), 2),//existencias validar
        brand: row.nombre_marca,//marca
        unit_price: parseFloat(row.precio_venta_online),//precio unitario sin impuestos
        total_price: ajusteDinero(parseFloat(total_price)),//precio total con impuestos +estampilla+ impuestos al consumo departamental validar
        purchase_price: ajusteDinero(parseFloat(row.precio_compra)),
        cost: parseFloat(row.costo),
        stock_min: parseFloat(row.stock_minino),
        stock_max: parseFloat(row.stock_maximo),
        warehouse_location: row.ubicacion,//ubicacion de la bodega
        is_active: row.es_activo == 1 ? true : false,//si esta activo
        online_store: row.mostrar_tienda_linea == 1 ? true : false,//si se puede vender en tienda online
        tax: {
            tax: parseFloat(row.valor_impuesto),//porcentaje de impuestos
            name_tax: parseFloat(row.nombre_impuesto),//name tax
            tax_value: parseFloat(total_impuestos_tax),//valor total de impuestos segun tax
            departmental_consumption_tax: parseFloat(row.total_impoconsumo),//valor de impuestos de licores
            stamp_tax: parseFloat(row.total_estampilla),//valor de impuesto de estanpillas
            tax_type: tax_type, //naturaleza del impuesto 1=IMPUESTO/IVA(TAX_STANDARD),3=ICO/IMPOCONSUMO(ICO),2=VALOR/BOLSA (VALUE)     
            tax_classification: tax_classification,//clasificacion tributaria 1=Gravado(taxed),3=Exento(Exempt),2=Excluido (excluded)     
        },
        product_type: product_type,//tipo de producto 1=Estandar(Standard),2=Compuesto/Ingredientes(Compound),//PRESENTATION
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
        base64_imagen: url_base64,
        configuration_compound_dynamic: null,//configuracion de compuesto dinamica
        configuration_compound: null,//configuracion de compuesto de ingredientes solo para chequiar inventario o que insumos tiene una enchata ejemplo
        //presentations maneja el formato de venta de un producto
        presentations: null, //solo aplica si es producto PRESENTATION y esta variable es diferente a null, para el manejo de productos que se descomponen ejemplo caja de huevos se descompone en media canasta de huevo / caja de medicamento/sobre de medicamento
        sell_only_presentation: row.vender_solo_presentacion == 1 ? true : false//si ahi presentaciones, y si es tru solo se venden las presentaciones 
    }
    //falta costos
    //organizar compuesto
    if (obj.product_type === 'COMPOUND') {
        if (row.configuracion_dinamica === null) {
            obj.product_type = 'STANDARD';
            //sacar ingredientes
            //  obj.configuration_compound = await $.get_data_compound(id_company, data, row.id_producto, rows_sucursal, rows_categoria, rows_imagen);
        } else {
            //configuration_compound ejemplo

            row.configuracion_dinamica = JSON.parse(row.configuracion_dinamica);
            obj.configuration_compound = [];
            obj.configuration_compound_dynamic = [];
            for (const conf of row.configuracion_dinamica) {
                let modelo = {
                    title: conf.titulo,
                    multiple_choices: conf.permitirMarcarMultiplesOpciones == 1 ? true : false,//permitirMarcarMultiplesOpciones aplica solo si type es opcion_multiple, este permite que cada opcion se puede seleccionar mas cantidades
                    maximum_options: parseInt(conf.cantidad_opciones),//cantidad_opciones
                    minimum_options: parseInt(conf.cantidad_opciones_minima),//cantidad_opciones_minima
                    order: conf.orden,//orden que se muestra las opciones
                    type: conf.tipo === 'opcion' ? 'option' : 'option_multiple',/*lista de opciones opcion(option)/opcion_multiple(option_multiple)*/
                    options: []
                };
                for (const opcion of conf.opciones) {
                    let product = await $.get_data_product_id(id_company, data, opcion.id_producto, rows_sucursal, rows_categoria, rows_imagen);
                    modelo.options.push({
                        product: product[0],//traer detalle del producto
                        price: ajusteDinero(parseFloat(opcion.precio)),//precio adicional si la selecciona validar
                        id_product: opcion.id_producto,
                        quantity: redondeo(parseFloat(opcion.cantidad), 2) < 0 ? 0 : redondeo(parseFloat(opcion.cantidad), 2),//cantidad de item que saca del inventario validar
                        alias: opcion.alias === undefined ? '' : opcion.alias//nombre alterno a mostrar si esta asignado muestro este y no el nombre del item
                    });
                }
                obj.configuration_compound_dynamic.push(modelo);
            }
            //sacar ingredientes
            obj.configuration_compound = await $.get_data_compound(id_company, data, row.id_producto, rows_sucursal, rows_categoria, rows_imagen);
        }
    }
    //falta ingredientes en compuestos para validar inventario
    if (obj.product_type === 'STANDARD') {
        //manejo de presentaciones
        if (row.presentaciones === undefined) {
            row.presentaciones = null;
        }
        if (row.presentaciones !== null) {
            row.presentaciones = JSON.parse(row.presentaciones);
            obj.product_type = 'PRESENTATION';
            obj.presentations = [];
            let index_p = 0;
            for (const presentacion of row.presentaciones) {
                let modelo = {
                    id: index_p,
                    name: presentacion.presentacion,
                    favorite: presentacion.favorito == 1 ? true : false,//lo muestra de primera
                    barcode: presentacion.codigoBarras,//codigo de barras del item
                    equivalence: presentacion.equivalencia,//valor facion de equivalencia ejemplo cantidad de unidades del padres/la cantidad de unidades del paquete a formar.
                    price_variation: [],//lista de precios por cantidad
                    //qty_from:0,//cantidad desde (maneja un precio desde un valor hasta un valor con los intervalor)
                    //  qty_to:9000,//cantidad hasta (maneja un precio desde un valor hasta un valor con los intervalor)
                    //  price:0//precio del intervalo
                }
                index_p++;
                for (let j = 0; j < 10; j++) {
                    if (presentacion['cantDes' + (j + 1)] === undefined) {
                        break;
                    }
                    let aux = {
                        qty_from: presentacion['cantDes' + (j + 1)],
                        qty_to: presentacion['cantHas' + (j + 1)]
                    }
                    if (presentacion['precio' + (j + 1) + '_online'] == 0 && presentacion['precio' + (j + 1)] > 0) {
                        presentacion['precio' + (j + 1) + '_online'] = presentacion['precio' + (j + 1)];
                    }
                    aux.price = presentacion['precio' + (j + 1) + '_online'];
                    modelo.price_variation.push(aux);
                    if (presentacion['cantHas' + (j + 1)] >= 99999) {
                        break;
                    }
                    if (presentacion['cantHas' + (j + 2)] !== undefined) {
                        if (presentacion['cantHas' + (j + 1)] > presentacion['cantHas' + (j + 2)]) {
                            break;
                        }
                    }
                }
                obj.presentations.push(modelo);
            }
        }
    }
    return obj;
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
$.get_url_store_cuenti = async (id_company, data) => {
    let conn = null;
    try {
        console.log("traer conexion");
        conn = await objGestorBd.getPool_bases();
        let SQL = objGestorSQL.getSqlNombre("integrador_tienddi", "get_url_tienddi");
        const rows = await conn.query2(SQL, { id_company: id_company, id_branch: data.id_branch });
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


/*************  ✨ Codeium Command ⭐  *************/
/**
 * Exports data to an Excel file and returns it as a base64 string.
 * 
 * This function takes an array of objects as input, where each object represents a row 
 * of data. The keys of the first object are used as column headers in the Excel file.
 * The data is written to a worksheet named 'Datos'.
 * 
 * @param {Array<Object>} data - An array of objects representing the data to be exported.
 * Each object should have consistent keys as they are used for column headers.
 * 
 * @returns {Promise<string>} - A promise that resolves to a base64 encoded string 
 * representing the Excel file. If the data array is empty, the function logs an error 
 * and returns undefined.
 * 
 * @throws Will log an error if there is an issue writing the Excel file to a buffer.
 */

/******  7f541aa9-7ea0-47b6-b872-c1f46d43826b  *******/
async function exportarAExcel(data) {
    const ExcelJS = require('exceljs');
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    if (data.length === 0) {
        console.error('El array de datos está vacío.');
        return;
    }

    // Obtener los encabezados de las columnas a partir de las claves del primer objeto
    const columnas = Object.keys(data[0]).map(key => ({ header: key, key }));

    // Asignar las columnas al worksheet
    worksheet.columns = columnas;

    // Agregar las filas de datos
    data.forEach(item => {
        worksheet.addRow(item);
    });

    // Guardar el archivo Excel
    try {
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer.toString('base64');
    } catch (error) {
        console.error('Error al guardar el archivo Excel:', error);
    }
}
$.getMetricas = async (id_company, data) => {
    let conn = null;
    try {
        conn = await objGestorBd.getConnectionEmpresa(id_company);

        let SQL = `SELECT cl2.id_tipo_cliente,t.medio_pago,d.JSON,cl2.ciudad,cl2.departamento,cl2.pais,cl2.alias,cl.id_cliente AS id_proveedor,cl2.direccion,
        d.id_producto,d.json,d.descripcion,
        d.cantidad-ABS(cantidad_develta) AS 'cantidad',
        (total/cantidad)*(cantidad-ABS(cantidad_develta))  AS total_neto,
        ps.costo as costo_actual,
        (d.costo/cantidad)*(cantidad-ABS(cantidad_develta)) AS costo,
        t.id_transacion,d.fecha_registro,t.n_transacion,t.nFactura,d.equivalencia,d.presentacion,cl2.identificacion,cl2.nombre_cliente,
        emp.nombre_completo AS empleado,cl.nombre_cliente AS provedor,cat.nombre_categoria,
        mar.nombre_marca,t.numeracion,p.sku,d.precio_venta
        FROM transacion_encabezado t
        INNER JOIN transacion_detalle d
        ON (t.id_transacion=d.id_transacion)
        INNER JOIN inv_producto p ON (p.id_producto=d.id_producto)
        INNER JOIN inv_producto_sucursal ps ON (ps.id=d.id_producto_sucursal)
        LEFT JOIN adm_impuestos adm ON(adm.id_impuesto=ps.id_impuesto)
        INNER JOIN adm_cliente cl ON(cl.id_cliente=ps.id_proveedor)
        INNER JOIN adm_cliente cl2 ON(cl2.id_cliente=t.id_cliente)
        INNER JOIN inv_categoria cat ON(cat.id_categoria=p.id_categoria)
        INNER JOIN inv_marca mar ON(mar.id_marca=p.id_marca)
        LEFT JOIN adm_empleados emp ON(emp.id_empleado=t.id_empleado)
        LEFT JOIN adm_empleados vend ON(vend.id_empleado=t.id_vendedor)
        WHERE t.tipoDocumento IN(1,9) AND t.es_nula=0 and t.id_sucursal=1 AND (t.fecha_registro BETWEEN :fecha1 AND  :fecha2)  ;`;
        let rows = await conn.query2(SQL, data);
        for (let row_detalle of rows) {
            row_detalle.cantidad = parseFloat(row_detalle.cantidad);
            row_detalle.total_neto = parseFloat(row_detalle.total_neto);
            row_detalle.costo = parseFloat(row_detalle.costo);
            row_detalle.costo_actual = parseFloat(row_detalle.costo_actual * row_detalle.cantidad);
        }
        let base64String = await exportarAExcel(rows);
        return base64String;
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
$.storeInCache = async function (cacheName, object, ttlInSeconds) {
    try {
        //validar cache
        var config = {
            method: "post",
            timeout: 1000 * 10, // Wait for 3 seconds
            url: process.env.url_api_cache_redis + "/api/v1/storeInCache",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                cacheName: cacheName,
                object: object,
                ttlInSeconds: ttlInSeconds,
            },
        };
        const resp = await axios(config);
        // console.log(resp.data);
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.error(err);
        return null;
    }
};
$.getFromCache = async function (cacheName) {
    try {
        //validar cache
        var config = {
            method: "post",
            timeout: 1000 * 10, // Wait for 3 seconds
            url: process.env.url_api_cache_redis + "/api/v1/getFromCache",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                cacheName: cacheName,
            },
        };
        const resp = await axios(config);
        // console.log(resp.data);
        if (resp.data.type == 0) {
            return null;
        } else {
            if (resp.data.message === null) {
                return null;
            } else {
                return resp.data.message;
            }
        }
    } catch (err) {
        // Handle Error Here
        console.error(err);
        return null;
    }
};

function isNonZeroNumber(v) {
    return v != null && isFinite(v) && Number(v) !== 0;
}

function imputeAvgPrice(rows) {
    // Asegúrate de que vengan ordenados por fecha ascendente (ds)
    // rows.sort((a,b) => new Date(a.ds) - new Date(b.ds));

    // 1) Forward fill: usar el anterior ≠ 0
    let last = null;
    for (let i = 0; i < rows.length; i++) {
        const v = Number(rows[i].avg_price);
        if (isNonZeroNumber(v)) {
            last = v;
        } else if (last != null) {
            rows[i].avg_price = last;
        }
    }

    // 2) Backward fill: para los que quedaron al inicio sin anterior ≠ 0
    let next = null;
    for (let i = rows.length - 1; i >= 0; i--) {
        const v = Number(rows[i].avg_price);
        if (isNonZeroNumber(v)) {
            next = v;
        } else if (next != null) {
            rows[i].avg_price = next;
        }
    }

    return rows;
}

$.getMetricas_producto = async (id_company, data) => {
    let conn = null;
    try {
        let cache = "cache_serie_tiempo_" + id_company + "_" + data.id_sucursal + "_" + data.id_producto + "_" + data.meses_antes;
        let row = null;
        let data_cache = await $.getFromCache(cache);
        if (data_cache === null) {
            conn = await objGestorBd.getConnectionEmpresa(id_company);
            let SQL_fechaMinima = `SELECT MIN(dt.fecha_registro) FROM transacion_detalle dt INNER JOIN transacion_detalle_ads da ON(da.id_detalle_transacion=dt.id_detalle_transacion)  
        WHERE  dt.id_producto=:id_producto AND da.id_sucursal=:id_sucursal AND da.es_nulo=0 AND da.tipo_documento IN(1,9) LIMIT 1;`;
            row = await conn.query2(SQL_fechaMinima, data);
            let fecha_minima = null;
            if (row.length > 0) {
                fecha_minima = row[0]['MIN(dt.fecha_registro)'];
            }

            //arreglar esto debemos garantizar eld escuento del dia realpath, montar bn y con cache para dejarlo listo
            //agregar variable si e spromocion con una variable exogena
            // Obtén la fecha actual
            const fechaActual = new Date();

            // Resta los meses a la fecha actual
            // La función setMonth se encarga de ajustar el año si es necesario.
            fechaActual.setMonth(fechaActual.getMonth() - parseInt(data.meses_antes));

            // Asigna la fecha modificada a la variable fecha_corte
            const fecha_corte = fechaActual;

            console.log("Fecha de corte:", fecha_corte);

            let SQL = `SELECT mes AS fecha,MONTH(mes)AS mes, DAY( dia )AS dia,SUM(ROUND (cantidad,2)) AS cantidad,
            SUM(ROUND (total_price,2)) AS total_price,
            (ROUND (avg_price,2)) AS avg_price,
            (ROUND (avg_discount,2)) AS avg_discount,
            SUM(ROUND (num_promotions,2)) AS num_promotions,
            SUM(ROUND (num_discounts,2)) AS num_discounts   FROM(
            SELECT  d._date AS mes,d._date AS dia,
            ROUND(SUM(dt.cantidad-dt.cantidad_develta),2) AS cantidad,

            ROUND(SUM((dt.total/(dt.cantidad))*(dt.cantidad-dt.cantidad_develta)),2) AS total_price,
            -- promedio real de precios dia
            ROUND(SUM((dt.total/(dt.cantidad))*(dt.cantidad-dt.cantidad_develta))/(SUM(dt.cantidad-dt.cantidad_develta)),2) AS avg_price,
            ROUND(SUM(((dt.descuento_valor/(dt.cantidad))*(dt.cantidad-dt.cantidad_develta)))/(SUM(dt.cantidad-dt.cantidad_develta)),2) AS avg_discount,
            SUM(dt.es_promocion) AS num_promotions,
            --  Aquí cuentas las veces que descuento_valor > 0
            SUM(CASE WHEN dt.descuento_valor > 0 THEN 1 ELSE 0 END) AS num_discounts

            FROM transacion_detalle dt
            INNER JOIN j4pro_aux.dimdate d ON(dt.DateKey_hora=d.DateKey_hora)
            INNER JOIN transacion_detalle_ads da ON(da.id_detalle_transacion=dt.id_detalle_transacion) WHERE da.id_sucursal=:id_sucursal AND da.es_nulo=0 AND da.tipo_documento IN(1,9) AND dt.id_producto=:id_producto AND 
            d._date >= DATE_SUB(CURDATE(), INTERVAL :meses_antes MONTH) AND d._date <= DATE_SUB(CURDATE(), INTERVAL 1 DAY) :fecha_minima
            GROUP BY d._day
            UNION ALL
            SELECT d._date AS mes,d._date AS dia,0 AS cantidad,0 AS total_price,
            0 AS avg_price,0 AS avg_discount,0 AS num_promotions,0 AS num_discounts   FROM j4pro_aux.dimdate d WHERE d._hour=0 AND 
            d._date >= DATE_SUB(CURDATE(), INTERVAL :meses_antes MONTH) AND d._date <= DATE_SUB(CURDATE(), INTERVAL 1 DAY) :fecha_minima
            GROUP BY d._day
            )d GROUP BY d.dia ORDER BY fecha;`;

            if (fecha_minima != null) {
                if (fecha_minima <= fecha_corte) {
                    SQL = SQL.replaceAll(":fecha_minima", "");
                } else {
                    const fechaMinimaFormateada = fecha_minima.toISOString().split('T')[0];
                    SQL = SQL.replaceAll(":fecha_minima", "AND d._date>='" + fechaMinimaFormateada + "'");
                }
            } else {
                SQL = SQL.replaceAll(":fecha_minima", "");
            }
            row = await conn.query2(SQL, data);

            for (let row_detalle of row) {
                // row_detalle.costo = parseFloat(row_detalle.costo);
                // row_detalle.precio_venta_neto = parseFloat(row_detalle.precio_venta_neto);
                //row_detalle.precio_unitario = parseFloat(row_detalle.precio_unitario);
                //row_detalle.cantidad = parseFloat(row_detalle.cantidad);

                row_detalle.y = parseFloat(row_detalle.cantidad);

                row_detalle.total_price = row_detalle.total_price === null ? 0 : row_detalle.total_price;
                row_detalle.avg_price = row_detalle.avg_price === null ? 0 : row_detalle.avg_price;
                row_detalle.avg_discount = row_detalle.avg_discount === null ? 0 : row_detalle.avg_discount;
                row_detalle.num_discounts = row_detalle.num_discounts === null ? 0 : row_detalle.num_discounts;
                row_detalle.num_promotions = row_detalle.num_promotions === null ? 0 : row_detalle.num_promotions;
                row_detalle.total_price2 = row_detalle.total_price2 === null ? 0 : row_detalle.total_price2;

                row_detalle.avg_price = parseFloat(row_detalle.avg_price);
                row_detalle.total_price = parseFloat(row_detalle.total_price);
                row_detalle.avg_discount = parseFloat(row_detalle.avg_discount);
                row_detalle.num_promotions = parseInt(row_detalle.num_promotions);
                row_detalle.num_discounts = parseInt(row_detalle.num_discounts);



                row_detalle.ds = row_detalle.fecha;
                delete row_detalle.fecha;
                delete row_detalle.cantidad;
                delete row_detalle.costo;
                delete row_detalle.precio_venta_neto;
                delete row_detalle.precio_unitario;
                delete row_detalle.mes;
                delete row_detalle.dia;
                row_detalle.promotions_flag = 0;
                row_detalle.discounts_flag = 0;
                if (row_detalle.num_discounts > 0) {
                    row_detalle.discounts_flag = 1;
                }
                if (row_detalle.num_promotions > 0) {
                    row_detalle.promotions_flag = 1;
                }
            }
            //row = imputeAvgPrice(row);
            await $.storeInCache(cache, row, ttlInSeconds = 86400);
        } else {
            row = data_cache;
        }
        if (data.export_excel == 1) {
            let base64String = await exportarAExcel(row);
            return base64String;
        } else {
            return row;
        };
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

$.get_token_api = async (id_empresa) => {
    let conn = null;
    try {
        console.log("traer conexion");
        conn = await objGestorBd.getPool_bases();
        let SQL = 'SELECT api FROM empresas WHERE id_empresa=:id_empresa;';
        const rows = await conn.query2(SQL, { id_empresa: id_empresa });
        return rows[0].api;
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
$.registrar_intencion_pago_cuenti_pay = async (data) => {
    let conn = null;
    try {
        console.log("traer conexion");
        conn = await objGestorBd.getPool_bases();
        let SQL = 'INSERT INTO boton_pago_intencion(id_empresa,id_transaccion,codigo,valor,url,x_gtm,id_sucursal)VALUES(:id_empresa,:id_transaccion,:codigo,:valor,:url,:x_gtm,:id_sucursal);';
        await conn.query2(SQL, data);
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
var uuidv4 = function (id_empresa, tipoDocumento, id_usuario) {
    return id_empresa + '-' + tipoDocumento + '-' + id_usuario + '-xxxxxxxx-xxxx-xxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

$.getPaymentLink = async (data) => {
    //recuperacion de link de pago
    let conn = null;
    try {
        console.log("traer conexion");
        conn = await objGestorBd.getPool_bases();
        let SQL = 'SELECT id,id_empresa,id_transaccion,codigo,valor,es_activo,`url`,x_gtm,id_sucursal FROM boton_pago_intencion WHERE id_empresa=:id_empresa AND id_transaccion=:id_transaccion AND es_activo=1;';
        return await conn.query2(SQL, data);
    } catch (err) {
        console.log("error:" + err);
        throw err;
    } finally {
        if (conn !== null) {
            console.log("cierre conexion " + conn.threadId);
            conn.end();//cerrar conexion y regresarlo
        }
    }
}
$.getPaymentLink_codigo = async (data) => {
    //recuperacion de link de pago
    let conn = null;
    try {
        console.log("traer conexion");
        conn = await objGestorBd.getPool_bases();
        let SQL = 'SELECT id,id_empresa,id_transaccion,codigo,valor,es_activo,`url`,x_gtm,id_sucursal FROM boton_pago_intencion WHERE codigo=:codigo and es_activo=1;';
        return await conn.query2(SQL, { codigo: data });
    } catch (err) {
        console.log("error:" + err);
        throw err;
    } finally {
        if (conn !== null) {
            console.log("cierre conexion " + conn.threadId);
            conn.end();//cerrar conexion y regresarlo
        }
    }
}
$.deletePaymentLink = async (data) => {
    //recuperacion de link de pago
    let conn = null;
    try {
        console.log("traer conexion");
        conn = await objGestorBd.getPool_bases();
        let SQL = 'UPDATE boton_pago_intencion SET es_activo=0 WHERE id=:id;';
        return await conn.query2(SQL, data);
    } catch (err) {
        console.log("error:" + err);
        throw err;
    } finally {
        if (conn !== null) {
            console.log("cierre conexion " + conn.threadId);
            conn.end();//cerrar conexion y regresarlo
        }
    }
}
$.createPaymentLink = async (data) => {
    try {
        let data_ultimo = await $.getPaymentLink(data);
        if (data_ultimo.length > 0) {
            return { type: 1, url: data_ultimo[0].url };
        }
        let token = await $.getTokenEfimero(data.id_empresa);
        //generar codigo
        data.codigo = uuidv4(data.id_empresa, data.id_transaccion, data.id_sucursal).replaceAll("-", "");

        let config = {
            method: 'post',
            timeout: 1000 * 4, // Wait for 5 seconds
            url: "https://api-cuenti-pay.cuenti.co/api/v1/createPaymentLink?withSms=0",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Auth-Token-Empresa': data.id_empresa,
                'Authorization': 'Bearer ' + token
            },
            data: {
                "companyId": parseInt(data.id_empresa),
                "branchId": parseInt(data.id_sucursal),
                "name": "Pago factura " + data.n_factura,
                "description": "Pago factura " + data.n_factura,
                "orderId": data.codigo,
                "active": true,
                "country": data.country,//"CO", 
                "currency": data.currency,//"COP",
                "domain": "https://pagos-cuenti-pay.cuenti.co",
                //"responseUrl": data.responseUrl,
                //"confirmationUrl": "https://pci0e7bcb0.execute-api.us-west-2.amazonaws.com",
                "webhookUrl": "https://integrador-cuenti-tienddi.cuenti.co/api/v1/integration-free/webhookCuentiPay/" + data.codigo,
                "param1": "test",
                "param2": "",
                "param3": "",
                "param4": "",
                "total": data.valor,
                "subtotal": data.valor,
                "shipping": 0,
                "discount": 0,
                "taxes": 0,
                "note": "test",
                "customerData": {
                    "fullName": data.nombre,
                    "email": data.email,
                    "phoneNumber": data.movil,
                    "phoneNumberPrefix": "+57",
                    "legalId": "test",
                    "legalIdType": "test"
                }
            }
        };
        const resp = await axios(config);
        data.url = resp.data.url;
        await $.registrar_intencion_pago_cuenti_pay(data);
        return { type: 1, url: resp.data.url };
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
    }
};

$.getConfigurations = async (data) => {
    try {
        let token = await $.getTokenEfimero(data.id_empresa);
        let config = {
            method: 'get',
            timeout: 1000 * 4, // Wait for 5 seconds
            url: "https://admin-cuenti-pay.cuenti.co/api/v1/information/getConfigurations",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Auth-Token-Empresa': data.id_empresa,
                'x-auth-id-sucursal': data.id_sucursal,
                'Authorization': 'Bearer ' + token
            }
        };
        const resp = await axios(config);

        return { type: 1, data: resp.data };
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
    }
};
$.getTokenEfimero = async (id_company) => {
    try {
        let api = await $.get_token_api(id_company);
        var config = {
            method: 'post',
            timeout: 1000 * 4, // Wait for 5 seconds
            url: "https://generate-token-cuenti.cuenti.co/generate_token",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                "pass": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5OTM5LTIwMjIwMjE2MDAwNzAzYTQ0YWFiLTZiMzktNDk3MC1hZTQ0LTZjOThkYmIzN2QxZSIsImlhdCI6MTY2MTUzMzY2NiwiZXhwIjpudWxsfQ.FiWeGRxbGC0h2PkS5eUcmxoPib0xpVR-IHEWw5-1Rms",
                "user": "cuenti",
                "token": api
            }
        };
        const resp = await axios(config);
        return resp.data.token;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
    }
};
$.checkPayment = async (codigo, id_empresa, id_sucursal) => {
    try {
        let token = await $.getTokenEfimero(id_empresa);
        let config = {
            method: 'get',
            timeout: 1000 * 4, // Wait for 5 seconds
            url: "https://api-cuenti-pay.cuenti.co/api/v1/checkPayment?ref=" + codigo + "&companyId=" + id_empresa + "&branchId=" + id_sucursal + "&isOrderId=1",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Auth-Token-Empresa': id_empresa,
                'x-auth-id-sucursal': id_sucursal,
                'Authorization': 'Bearer ' + token
            }
        };
        const resp = await axios(config);

        return resp.data;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
    }
};
$.activarPagos = async (data) => {
    try {
        let token = await $.getTokenEfimero(data.id_empresa);
        let lstPagos_pendientes = await $.getPaymentLink(data);
        let lst_configuraciones;
        if (lstPagos_pendientes.length > 0) {
            //configuraciones
            lst_configuraciones = await $.getConfigurations({ id_empresa: data.id_empresa, id_sucursal: lstPagos_pendientes[0].id_sucursal });
            lst_configuraciones = lst_configuraciones.data.data;
        }
        let cantidad = 0;
        for (let row of lstPagos_pendientes) {
            //validar cada referencia si esta ya esta pagada
            let r = await validacionPagosCuentiPay(token, lst_configuraciones, row);
            if (r.type == 1 || r.type == 2) {
                //desactivar intenciones
                await $.deletePaymentLink({ id: row.id });
                cantidad++;
            }
        }
        return { type: 1, cantidad: cantidad };
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
    }
};
let validacionPagosCuentiPay = async function (token, lst_configuraciones, row) {
    //validar cada referencia si esta ya esta pagada
    let r_pago = await $.checkPayment(row.codigo, row.id_empresa, row.id_sucursal);
    if (r_pago.status == 'success') {
        if (r_pago.payment.payload_extra.status_payment == 'APPROVED') {
            //buscar datos de de payment_gateways
            let bank_id = 1;
            let payment_medium_id = 1;
            let cost_center_id = 1;
            let employee_id = 1;
            for (let conf of lst_configuraciones.payment_gateways) {
                if (conf.payment_gateway.code == r_pago.payment.payload_extra.gateway) {
                    bank_id = conf.bank_id;
                    payment_medium_id = conf.payment_method_id;
                    cost_center_id = conf.cost_center_id;
                    employee_id = conf.employee_id;
                    break;
                }
            }
            try {
                let url = "http://solo-restaurantes.interna.cuenti.com:9855/jServerj4ErpPro/com/j4ErpPro/server/api_sin_token/agregarPagoTransacionCuentiPay2";
                if (process.env.environment_data_base === 'dev') {
                    url = "http://localhost:8084/jServerj4ErpPro/com/j4ErpPro/server/api_sin_token/agregarPagoTransacionCuentiPay2";
                }
                //registramos el recibo de caja
                let config = {
                    method: 'post',
                    timeout: 1000 * 4, // Wait for 5 seconds
                    url: url,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Auth-Token-Empresa': row.id_empresa,
                        'x-auth-id-sucursal': row.id_sucursal,
                        'Authorization': 'Bearer ' + token
                    },
                    data: {
                        "id_empresa": row.id_empresa,
                        "id_sucursal": row.id_sucursal,
                        "transaction_id": r_pago.payment.payload_extra.transaction_id,
                        "id": r_pago.payment.payload_extra.id,
                        "id_transacion_cuenti": row.id_transaccion,
                        "bank_id": 1,
                        "payment_medium_id": 1,
                        "employee_id": 1,
                        "cost_center_id": 1,
                        "amount": parseFloat(r_pago.payment.payload_extra.amount),
                        "x_gtm": row.x_gtm,
                        gateway: r_pago.payment.payload_extra.gateway
                    }
                };
                const resp = await axios(config);
                console.log(resp.data);
                return { type: 1, status: 200, message: "ok" }
            } catch (error) {
                if (error.response.status == 452) {
                    return { type: 2, status: error.response.status, message: error.response.data.message }
                } else {
                    return { type: 0, status: error.response.status, message: error.response.data.message }
                }
            }
        }
    }
}

$.webhookCuentiPay = async (_data, codigo) => {
    try {
        console.log(_data)
        console.log("codigo:" + codigo)
        let data = await $.getPaymentLink_codigo(codigo);
        if (data.length > 0) {
            data = data[0];
            let token = await $.getTokenEfimero(data.id_empresa);
            let lstPagos_pendientes = [data];
            let lst_configuraciones;
            if (lstPagos_pendientes.length > 0) {
                //configuraciones
                lst_configuraciones = await $.getConfigurations({ id_empresa: data.id_empresa, id_sucursal: lstPagos_pendientes[0].id_sucursal });
                lst_configuraciones = lst_configuraciones.data.data;
            }
            //validar cada referencia si esta ya esta pagada
            let r = await validacionPagosCuentiPay(token, lst_configuraciones, lstPagos_pendientes[0]);
            if (r.type == 1 || r.type == 2) {
                //desactivar intenciones
                await $.deletePaymentLink({ id: lstPagos_pendientes[0].id });
                return { type: 1 };
            } else {
                return r;
            }
        } else {
            return { type: 1 };
        }
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
    }
};

$.get_conf_modulos_sucursal = async (id_company, id_sucursal) => {
    let cache = "cache_conf_modulos_sucursal_" + id_company + "_" + id_sucursal;
    let data_cache = await $.getFromCache(cache);
    let r = null;
    if (data_cache === null) {
        let conn = null;
        try {
            conn = await objGestorBd.getConnectionEmpresa(id_company);
            let SQL = 'SELECT conf_modulos FROM adm_sucursal WHERE  id_sucursal=:id_sucursal;';
            r = await conn.query2(SQL, { id_sucursal: id_sucursal });
            return r[0].conf_modulos;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            if (conn !== null) {
                console.log("cierre conexion " + conn.threadId);
                // conn.end();
                conn.release(); //release to pool
            }
            await $.storeInCache(cache, r[0].conf_modulos, ttlInSeconds = 60 * 60); //cache por 1 hora
        }
    } else {
        return data_cache;
    }
};
$.get_conf_modulos_sucursal_generarQr_url_dian = async (id_company, id_sucursal) => {
    let conf_modulos = await $.get_conf_modulos_sucursal(id_company, id_sucursal);
    let generarQr_url_dian = false;
    if (conf_modulos !== null && conf_modulos !== undefined) {
        try {
            conf_modulos = JSON.parse(conf_modulos);
            if (conf_modulos.generarQr_url_dian !== undefined && conf_modulos.generarQr_url_dian !== null) {
                generarQr_url_dian = conf_modulos.generarQr_url_dian;
            };
        } catch (error) {
            console.error(error);
        }
    }
    if (generarQr_url_dian == 0) {
        generarQr_url_dian = false;
    }
    if (generarQr_url_dian == 1) {
        generarQr_url_dian = true;
    }
    return { type: 1, generarQr_url_dian: generarQr_url_dian };
};

$.webhook_parking = async (id_company, id_sucursal) => {
    let conn = null;
    try {
        // conn = await objGestorBd.getConnectionEmpresa(id_company);
        // let SQlCategoria = objGestorSQL.getSqlNombre("integrador_tienddi", "list_categorias");
        // await conn.query2(SQlCategoria, {});

        return {
            "externalId": "cuenti-51814955",
            "openBarrier": true
        };
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

// Exportamos
module.exports = $;
