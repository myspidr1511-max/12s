// /src/app/routes/client.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const { getClient, upsertClient } = require('../../db/repo/clients.repo');
const { enc } = require('../../utils/crypto');

router.get('/api/client/me', [requireAuth, requireRole('client')], async (req,res)=>{
  try{
    const c = await getClient(req.user.client_id);
    return res.json({ ok:true, client:c });
  }catch(e){ console.error(e); return res.status(500).json({ok:false}); }
});

router.patch('/api/client/me', [requireAuth, requireRole('client')], async (req,res)=>{
  try{
    const patch={ id:req.user.client_id };
    if('display_name' in req.body) patch.display_name = req.body.display_name;
    if('openrouter_model' in req.body) patch.openrouter_model = req.body.openrouter_model||null;
    if('openrouter_key' in req.body) patch.openrouter_key_enc = req.body.openrouter_key? enc(req.body.openrouter_key):null;
    if('business_prompt' in req.body) patch.business_prompt = req.body.business_prompt||null;
    if('telegram_token' in req.body){ patch.tg_bot_token_enc = req.body.telegram_token? enc(req.body.telegram_token):null; patch.tg_status = req.body.telegram_token?'ready':'idle'; }
    const saved = await upsertClient(patch);
    return res.json({ ok:true, client:saved });
  }catch(e){ console.error(e); return res.status(500).json({ok:false}); }
});

module.exports = router;
