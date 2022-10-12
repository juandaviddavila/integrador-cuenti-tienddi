'use strict';
var gestorSQL = function () {
    const fs = require('fs');
    var j4 = {};
    let lstSql = [];
    var getFilesInFolder = async function (realPath, esCarpeta, callback) {

        let files = fs.readdirSync(realPath);
        let r = [];
        for (var i = 0; i < files.length; i++) {
            let statsObj = await fs.statSync(realPath + "/" + files[i]);
            if (statsObj.isFile() && !esCarpeta) {
                r.push(realPath + '/' + files[i]);
            }
            if (statsObj.isDirectory() && esCarpeta) {
                r.push(realPath + '/' + files[i]);
            }
        }
        return await r;
    };
    j4.generarJsonBase = async function () {
        lstSql = [];
        let ruta = process.cwd() + '/sql_json/';
        let carpetas = await getFilesInFolder(ruta, true)
       // console.log(carpetas);  // lista de moduelos
        for (let i = 0; i < carpetas.length; i++) {
            //lista categorias
            let categorias = await getFilesInFolder(carpetas[i], true);
            for (let j = 0; j < categorias.length; j++) {
                let nombreCategoria = categorias[j].split('/')[categorias[j].split('/').length - 1];
                lstSql.push({
                    codigo: parseInt(nombreCategoria.split('-')[0]),
                    nombre: nombreCategoria.split('-')[1], lstSql: []
                });
                let sentenciasSQL = await getFilesInFolder(categorias[j], false);
                for (let h = 0; h < sentenciasSQL.length; h++) {
                    let nombreSentencia = sentenciasSQL[h].split('/')[sentenciasSQL[h].split('/').length - 1].replace('.sql', '');
                    let sql = await fs.readFileSync(sentenciasSQL[h], 'utf8').trim();
                    lstSql[lstSql.length - 1].lstSql.push({
                        codigo: parseInt(nombreSentencia.split('-')[0]),
                        nombre: nombreSentencia.split('-')[1],
                        sql: sql
                    });
                }
            }
            let nombreCarpeta = carpetas[i].split('/')[carpetas[i].split('/').length - 1];
           // console.log(lstSql);
            //grabar json global
            fs.writeFileSync(ruta + '/' + nombreCarpeta + '.json', JSON.stringify(lstSql));
        };
    };
    j4.getSqlCodigo = function (codigo_categoria,nombre_sentencia) {
        for (let i = 0; i < lstSql.length; i++) {
            if(lstSql[i].codigo==codigo_categoria){
                for (let j = 0; j < lstSql[i].lstSql.length; j++) {
                    if(lstSql[i].lstSql[j].nombre==nombre_sentencia){
                        return lstSql[i].lstSql[j].sql;
                    }
                }
                break;
            }
        }
        throw new Error("codigo de categoria "+codigo_categoria+" o sentencia "+nombre_sentencia+" no existe");
    };
    j4.getSqlNombre = function (nombre_categoria,nombre_sentencia) {
        for (let i = 0; i < lstSql.length; i++) {
            if(lstSql[i].nombre==nombre_categoria){
                for (let j = 0; j < lstSql[i].lstSql.length; j++) {
                    if(lstSql[i].lstSql[j].nombre==nombre_sentencia){
                        return lstSql[i].lstSql[j].sql;
                    }
                }
                break;
            }
        }
        throw new Error("codigo de categoria "+codigo_categoria+" o sentencia "+nombre_sentencia+" no existe");
    };
    //iniciar json
    j4.generarJsonBase();
    return {
        j4: j4
    };
}();
// Exportamos las funciones en un objeto json para poder usarlas en otros fuera de este fichero
module.exports = gestorSQL.j4;

