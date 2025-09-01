const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const routesPublic = require('./routes_public');
const routesAuth   = require('./routes_auth');
const routesAdmin  = require('./routes_admin');
const routesClient = require('./routes_client');
const routesAI     = require('./routes_ai');
const routesWaWeb  = require('./routes_waweb');
const igConnect    = require('./instagram_connect');
const webhooks     = require('./webhooks');

const { bootAll }  = require('./waweb_manager');

const app = express();

app.use(cors({
  origin: (origin, cb)=>{
    const allowed = (process.env.WEB_ORIGIN||'').split(',').map(s=>s.trim()).filter(Boolean);
    if(!origin || allowed.length===0 || allowed.includes(origin)) return cb(null,true);
    return cb(null,true); // اسمح للجميع لو ما حددت ド
  }
}));
app.use(bodyParser.json({ limit:'2mb' }));
app.use(bodyParser.urlencoded({ extended:true }));

app.get('/', (_req,res)=>res.json({ ok:true, up:true }));

app.use(routesPublic);
app.use(routesAuth);
app.use(routesAdmin);
app.use(routesClient);
app.use(routesAI);
app.use(routesWaWeb);
app.use(igConnect);
app.use(webhooks);

// خطأ عام
app.use((err,_req,res,_next)=>{
  console.error('UNCAUGHT', err);
  res.status(500).json({ ok:false, error:'server_error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async ()=>{
  console.log(`HTTP server on :${PORT}`);
  try{ await bootAll(); }catch(e){ console.error('BOOT_ALL_ERR', e); }
});
