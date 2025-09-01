// /src/app/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const { handleInbound } = require('../services/inbound.service');

router.post('/api/debug/ai-reply', async (req,res)=>{
  try{
    const { client_id, text } = req.body||{};
    if(!client_id || !text) return res.status(400).json({ ok:false, error:'missing_fields' });
    const reply = await handleInbound({ clientId:client_id, text, channel:'debug' });
    return res.json({ ok:true, reply });
  }catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});

module.exports = router;
