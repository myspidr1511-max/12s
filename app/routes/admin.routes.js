// /src/app/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const { v4: uuid } = require('uuid');
const { enc } = require('../../utils/crypto');
const { upsertClient, listClients, deleteClientFull } = require('../../db/repo/clients.repo');
const { adminListPlans, upsertPlan, deletePlan } = require('../../db/repo/plans.repo');
const { newToken } = require('../../db/repo/tokens.repo');
const { analyticsSummary } = require('../../db/repo/analytics.repo');

// protect
const requireAdmin = [requireAuth, requireRole('admin')];

// Create client
router.post('/api/admin/clients', requireAdmin, async (req,res)=>{
  try{
    const { id, display_name, email, password, openrouter_model, openrouter_key, business_prompt, telegram_token, channels } = req.body||{};
    if(!id || !email || !password) return res.status(400).json({ ok:false, error:'missing_required_fields' });

    const row = {
      id:String(id),
      display_name:display_name||String(id),
      openrouter_model:openrouter_model||null,
      openrouter_key_enc: openrouter_key? enc(openrouter_key):null,
      business_prompt:business_prompt||null,
      tg_bot_token_enc: telegram_token? enc(telegram_token):null,
      tg_status: telegram_token?'ready':'idle',
      channels: Array.isArray(channels)? channels: [],
      is_active: true
    };
    await upsertClient(row, { createUser: { email, password, role:'client', client_id:String(id) } });
    return res.json({ ok:true });
  }catch(e){ console.error(e); return res.status(500).json({ ok:false, error:'create_failed' }); }
});

// Clients list
router.get('/api/admin/clients', requireAdmin, async (_req,res)=>{
  try{ const cs=await listClients(); return res.json({ ok:true, clients: cs }); }
  catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});

// Patch client
router.patch('/api/admin/clients/:id', requireAdmin, async (req,res)=>{
  try{
    const id = String(req.params.id);
    const patch = { id };
    if('display_name' in req.body) patch.display_name = req.body.display_name;
    if('openrouter_model' in req.body) patch.openrouter_model = req.body.openrouter_model||null;
    if('openrouter_key' in req.body) patch.openrouter_key_enc = req.body.openrouter_key? enc(req.body.openrouter_key):null;
    if('business_prompt' in req.body) patch.business_prompt = req.body.business_prompt||null;
    if('channels' in req.body) patch.channels = Array.isArray(req.body.channels)? req.body.channels: [];
    if('telegram_token' in req.body){ patch.tg_bot_token_enc = req.body.telegram_token? enc(req.body.telegram_token):null; patch.tg_status = req.body.telegram_token?'ready':'idle'; }
    await upsertClient(patch);
    return res.json({ ok:true });
  }catch(e){ console.error(e); return res.status(500).json({ ok:false, error:'update_failed' }); }
});

// Delete client fully
router.delete('/api/admin/clients/:id', requireAdmin, async (req,res)=>{
  try{ await deleteClientFull(String(req.params.id)); return res.json({ ok:true }); }
  catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});

// WA QR token
router.post('/api/admin/clients/:id/waweb/qr-session', requireAdmin, async (req,res)=>{
  try{
    const client_id = String(req.params.id);
    const ttl = Number(req.body?.ttl_minutes||10)||10;
    const max_uses = Number(req.body?.max_uses||1)||1;
    const tok = uuid().replace(/-/g,'');
    const expires_at = new Date(Date.now() + ttl*60*1000).toISOString();
    await newToken({ type:'waweb_qr', client_id, token:tok, max_uses, expires_at, created_by:req.user.uid });
    const url = `${process.env.PUBLIC_BASE}/waweb/${tok}/qr.png`;
    return res.json({ ok:true, url, ttl, max_uses });
  }catch(e){ console.error(e); return res.status(500).json({ ok:false, error:'qr_failed' }); }
});

// IG link token
router.post('/api/admin/clients/:id/instagram/link', requireAdmin, async (req,res)=>{
  try{
    const client_id = String(req.params.id);
    const ttl = Number(req.body?.ttl_minutes||30)||30;
    const tok = uuid().replace(/-/g,'');
    const expires_at = new Date(Date.now() + ttl*60*1000).toISOString();
    await newToken({ type:'ig_link', client_id, token:tok, max_uses:1, expires_at, created_by:req.user.uid });
    const url = `${process.env.PUBLIC_BASE}/connect/instagram/${tok}`;
    return res.json({ ok:true, url, ttl });
  }catch(e){ console.error(e); return res.status(500).json({ ok:false, error:'ig_failed' }); }
});

// Plans CRUD
router.get('/api/admin/plans', requireAdmin, async (_req,res)=>{
  try{ const rows=await adminListPlans(); return res.json({ ok:true, plans:rows }); }
  catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});
router.post('/api/admin/plans', requireAdmin, async (req,res)=>{
  try{ const saved=await upsertPlan(req.body||{}); return res.json({ ok:true, plan:saved }); }
  catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});
router.patch('/api/admin/plans/:id', requireAdmin, async (req,res)=>{
  try{ const row=Object.assign({},req.body||{}, {id:req.params.id}); const saved=await upsertPlan(row); return res.json({ ok:true, plan:saved }); }
  catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});
router.delete('/api/admin/plans/:id', requireAdmin, async (req,res)=>{
  try{ await deletePlan(req.params.id); return res.json({ ok:true }); }
  catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});

// Analytics
router.get('/api/admin/analytics/summary', requireAdmin, async (_req,res)=>{
  try{ const s=await analyticsSummary(); return res.json({ ok:true, summary:s }); }
  catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});

module.exports = router;
