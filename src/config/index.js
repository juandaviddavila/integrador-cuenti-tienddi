let app= require('../../main.js');

//iniciar conexion a la base de datos
 require('../helpers/gestorBd');
 const gestorSQL =  require('../helpers/gestorSQL');
// Importamos todas las rutas

require("fs").readdirSync(global.normalizedPath+'/routes').forEach(function(file) {
  //  require('../../src/routes/integrator-tienddi-router')
  require("../../src/routes/" + file);
});