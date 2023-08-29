'use strict';
var gestorBd = function () {
    var j4 = {};
    var listaServer = [];
    //iciar pool de conexiones
    const mariadb = require('mariadb');
    j4.getPool_bases = async function () {
        let conn = await j4.pool_bases.getConnection();
        conn.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };

        conn.query2 = function (query, values) {
            query = conn.queryFormat(query, values);
            return this.query(query);
        };
        return conn;
    };

    let iniciarPoolBase = function () {
        if (process.env.environment_data_base === 'dev') {
            console.log("Inicia pool en entrono de desarrollo");
            j4.pool_bases = mariadb.createPool({
                host: process.env.dbHost_dev,
                user: process.env.dbUser_dev,
                password: process.env.dbPwd_dev,
                database: process.env.database_dev,
                connectionLimit: parseInt(process.env.poolSizeBase_dev),
                port: process.env.portDb_dev
            });
        }else{
            console.log("Inicia pool en entrono de producción");
            j4.pool_bases = mariadb.createPool({
                host: process.env.dbHost_pro,
                user: process.env.dbUser_pro,
                password:process.env.dbPwd_pro,
                database: process.env.database_pro,
                connectionLimit: parseInt(process.env.poolSizeBase_pro),
                port: process.env.portDb_pro
            });
        }
        j4.pool_bases.on('connection', (conn) => console.log(`connection ${conn.threadId} has been created in pool`));
        j4.pool_bases.on('release', (conn) => console.log(`release ${conn.threadId} has been created in pool`));
    };

    j4.consultaServidores = async function (id_empresa, idAplicacion) {
        let conn = null;
        try {
            console.log("tarer conexion");
            conn = await j4.pool_bases.getConnection();
            console.log("connected ! connection id is " + conn.threadId);
            var SQL = "SELECT e.id_servidor,e.nombreBaseDatos,ip,puerto,usuario,\n"
                + "clave,initialSize,maxActive,maxIdle,maxTiempoInatividad,\n"
                + "maxTiempoEsperaEntregarConecion FROM aplicaciones_empresa e INNER JOIN Servidores s ON(e.id_servidor=s.id) \n"
                + " WHERE e.id_empresa=? AND e.id_aplicacion=?;";
            var row = await conn.query(SQL, [id_empresa, idAplicacion]);
            if (row.length > 0) {
                return await row[0];
            } else {
                throw (new Error('Aplicacion no generapara empresa ' + id_empresa));
            }

        } catch (err) {
            console.log("error:" + err);
            throw err;
        } finally {
            if (conn !== null) {
                console.log("cierre conexion " + conn.threadId);
                conn.release(); //release to pool
                //conn.end();
            }
        }
    };
    j4.borrarEmpresa_server = function (id_empresa) {
        for (let i = 0; i < listaServer.length; i++) {
            for (let j = 0; j < listaServer[i].lstEmpresas.length; j++) {
                if (listaServer[i].lstEmpresas[j].id_empresa == id_empresa) {
                    //encontre borro listaServer[i].lstEmpresas[j]
                    listaServer[i].lstEmpresas.splice(j);
                     break;
                }
            }
        }
    };
    j4.getConnectionEmpresa = async function (id_empresa, _idAplicacion) {
        let idAplicacion = parseInt(process.env.id_application);
        let indiceServer = -1;
        let indiceEmpresa = -1;
        for (let i = 0; i < listaServer.length; i++) {
            for (let j = 0; j < listaServer[i].lstEmpresas.length; j++) {
                if (listaServer[i].lstEmpresas[j].id_empresa == id_empresa) {
                    indiceServer = i;
                    indiceEmpresa = j;
                    break;
                }
            }
        }
        if (indiceServer === -1) {
            //consultaServidores
            let objServer = await j4.consultaServidores(id_empresa, idAplicacion);
            //busco id server
            for (let i = 0; i < listaServer.length; i++) {
                if (listaServer[i].id_servidor == objServer.id_servidor) {
                    indiceServer = i;
                }
            }
            if (indiceServer > -1) {
                //registrar Empresa en server
                listaServer[indiceServer].lstEmpresas.push({
                    id_empresa: id_empresa,
                    nombreBaseDatos: objServer.nombreBaseDatos
                });
                //buscar de nuevo la conexion
                return await j4.getConnectionEmpresa(id_empresa, idAplicacion);
            } else {
                //registrar server
                objServer.maxActive = parseInt(process.env.poolSizeBase_dev);
                if(process.env.environment_data_base==='pro'){
                    objServer.maxActive = parseInt(process.env.poolSizeBase_pro);
                }
                var pool = mariadb.createPool({
                    host: objServer.ip,
                    user: objServer.usuario,
                    password: objServer.clave,
                    connectionLimit: objServer.maxActive,
                    port: objServer.puerto,
                    acquireTimeout: 1000 * 60
                });
                j4.pool_bases.on('connection', (conn) => console.log(`connection ${conn.threadId} has been created in pool idserver ${objServer.id_servidor}`));
                j4.pool_bases.on('release', (conn) => console.log(`release ${conn.threadId} has been created in pool idserver ${objServer.id_servidor}`));
                listaServer.push({
                    id_servidor: objServer.id_servidor,
                    ip: objServer.ip,
                    puerto: objServer.puerto,
                    usuario: objServer.usuario,
                    clave: objServer.clave,
                    initialSize: objServer.initialSize,
                    maxActive: objServer.maxActive,
                    maxIdle: objServer.maxIdle,
                    maxTiempoInatividad: objServer.maxTiempoInatividad,
                    lstEmpresas: [{ id_empresa: id_empresa, nombreBaseDatos: objServer.nombreBaseDatos }],
                    pool: pool
                });
                pool.on('connection', (conn) => console.log(`connection ${conn.threadId} has been created in pool idserver ${objServer.id_servidor}`));
                pool.on('release', (conn) => console.log(`release ${conn.threadId} has been created in pool idserver ${objServer.id_servidor}`));
                return await j4.getConnectionEmpresa(id_empresa, idAplicacion);
            }
            //registrar contenedor
        } else {
            console.log("server encontrado en indiceServer:" + indiceServer + " indiceEmpresa:" + indiceEmpresa);
            let conn = await listaServer[indiceServer].pool.getConnection();
            conn.queryFormat = function (query, values) {
                if (!values) return query;
                return query.replace(/\:(\w+)/g, function (txt, key) {
                    if (values.hasOwnProperty(key)) {
                        return this.escape(values[key]);
                    }
                    return txt;
                }.bind(this));
            };
            conn.query2 = function (query, values) {
                query = conn.queryFormat(query, values);
                return this.query(query);
            };
            await conn.query("use " + listaServer[indiceServer].lstEmpresas[indiceEmpresa].nombreBaseDatos);
            return await conn;
        }
    };
    //iniciar pool bases
    iniciarPoolBase();

    return {
        j4: j4,
    };
}();
// Exportamos las funciones en un objeto json para poder usarlas en otros fuera de este fichero
module.exports = gestorBd.j4;

