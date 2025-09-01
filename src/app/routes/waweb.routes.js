// /src/app/routes/waweb.routes.js
const express = require('express');
const router = express.Router();
const { getToken, useToken } = require('../../db/repo/tokens.repo');
const { getQRBufferForClient } = require('../services/waweb_qr_store');

router.get('/waweb/:token/qr.png', async (req,res)=>{
  try{
    const tok = req.params.token;
    const row = await getToken(tok);
    if(!row || row.type!=='waweb_qr') return res.status(404).end();
    if(new Date(row.expires_at).getTime() < Date.now()) return res.status(410).send('expired');
    if(row.max_uses && row.used_count>=row.max_uses) return res.status(429).send('used_up');

    const png = getQRBufferForClient(row.client_id);
    if(!png) return res.status(503).send('qr_not_ready');

    await useToken(tok);
    res.setHeader('Content-Type','image/png');
    return res.end(png);
  }catch(e){ console.error(e); return res.status(500).end(); }
});

module.exports = router;
