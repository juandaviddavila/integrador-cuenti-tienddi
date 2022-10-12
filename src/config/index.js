let app= require('../../main.js');

const autenticacion = require('../../src/autenticacion/index');
const middleware = autenticacion.middleware_liviano;

//iniarconexion a la base de datos
 require('../config/gestorBd');
 const gestorSQL =  require('../config/gestorSQL');


// Importamos las rutas de modulos
// Importamos ruta de autenticacion
app.use(global.baseUrl, autenticacion.autenticar);//manejo de ruta de seguridad

app.use(global.baseUrl+'/integracion',middleware, require('../../src/controllers/integracion_erpControllers'));
