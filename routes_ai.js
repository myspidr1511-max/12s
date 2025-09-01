const express = require('express');
const router = express.Router();
const { handleInbound } = require('./inbound');

router.post('/api/debug/ai-reply', async (req,res)=>{
  try{
    const { client_id, text } = req.body||{};
    if(!client_id || !text) return res.status(400).json({ ok:false, error:'missing_fields' });
    const reply = await handleInbound({ clientId:client_id, text, channel:'debug' });
    res.json({ ok:true, reply });
  }catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});

module.exports = router;
