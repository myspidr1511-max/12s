const express = require('express');
const router = express.Router();
const { getToken, useToken } = require('./db');
const { getQRBufferForClient } = require('./waweb_qr_store');

router.get('/waweb/:token/qr.png', async (req,res)=>{
  try{
    const tok = await getToken(req.params.token);
    if(!tok || tok.type!=='waweb_qr') return res.status(404).end();
    if(new Date(tok.expires_at).getTime() < Date.now()) return res.status(410).send('expired');
    if(tok.max_uses && tok.used_count>=tok.max_uses) return res.status(429).send('used_up');

    const png = getQRBufferForClient(tok.client_id);
    if(!png) return res.status(503).send('qr_not_ready');

    await useToken(req.params.token);
    res.setHeader('Content-Type','image/png');
    res.end(png);
  }catch(e){ console.error(e); res.status(500).end(); }
});

module.exports = router;
