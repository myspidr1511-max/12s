// /src/app/server.js
const express = require('express');
const cors = require('./middlewares/cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('./middlewares/rateLimit');
const logger = require('../utils/logger');

const routesPublic   = require('./routes/public.routes');
const routesAuth     = require('./routes/auth.routes');
const routesAdmin    = require('./routes/admin.routes');
const routesClient   = require('./routes/client.routes');
const routesAI       = require('./routes/ai.routes');
const routesWaWeb    = require('./routes/waweb.routes');
const routesInstagram= require('./routes/instagram.routes');

const { bootAll } = require('./services/waweb.manager');

const app = express();
app.use(cors);
app.use(rateLimit);                              // بسيط لكل الطلبات
app.use(bodyParser.json({ limit:'2mb' }));
app.use(bodyParser.urlencoded({ extended:true }));

app.get('/', (_req,res)=>res.json({ ok:true, up:true }));

app.use(routesPublic);
app.use(routesAuth);
app.use(routesAdmin);
app.use(routesClient);
app.use(routesAI);
app.use(routesWaWeb);
app.use(routesInstagram);

app.use(errorHandler);                           // آخر شيء

const PORT = process.env.PORT || 3000;
app.listen(PORT, async ()=>{
  logger.info(`HTTP server on :${PORT}`);
  try { await bootAll(); } catch(e){ logger.error('BOOT_ALL_ERR', e); }
});
