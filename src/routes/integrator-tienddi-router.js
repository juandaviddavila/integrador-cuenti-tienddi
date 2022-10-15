let app= require('../../main.js');
// Importamos rutas
const middleware = require('../middleware/middleware');
app.use(global.baseUrl+'/integration',middleware, require('../controllers/integrator-tienddi-ctr'));

app.use(global.baseUrl+'/integration-free', require('../controllers/integrator-tienddi-ctr-free'));
