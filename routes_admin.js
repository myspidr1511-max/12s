const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('./auth');
const { enc } = require('./crypto');
const { v4:uuid } = require('uuid');
const argon2 = require('argon2');
const {
  upsertClient, insertUser, listClients, deleteClientFull,
  adminListPlans, upsertPlan, deletePlan,
  newToken, analyticsSummary
} = require('./db');

const requireAdmin = [requireAuth, requireRole('admin')];

// إنشاء عميل
router.post('/api/admin/clients', requireAdmin, async (req,res)=>{
  try{
    const { id, display_name, sector, email, password, openrouter_model, openrouter_key, business_prompt, telegram_token, channels } = req.body||{};
    if(!id || !email || !password) return res.status(400).json({ ok:false, error:'missing_required_fields' });

    const row = {
      id:String(id),
      display_name:display_name||String(id),
      sector: sector || null,
      openrouter_model:openrouter_model||null,
      openrouter_key_enc: openrouter_key? enc(openrouter_key):null,
      business_prompt:business_prompt||null,
      tg_bot_token_enc: telegram_token? enc(telegram_token):null,
      tg_status: telegram_token?'ready':'idle',
      channels: Array.isArray(channels)? channels: [],
      is_active: true
    };
    await upsertClient(row);
    const hash = await argon2.hash(password);
    await insertUser({ email, password_hash:hash, role:'client', client_id:String(id) });
    res.json({ ok:true });
  }catch(e){ console.error(e); res.status(500).json({ ok:false, error:'create_failed' }); }
});

// قائمة العملاء (Folder View)
router.get('/api/admin/clients', requireAdmin, async (_req,res)=>{
  try{ const cs=await listClients(); res.json({ ok:true, clients: cs }); }
  catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});

// تعديل عميل
router.patch('/api/admin/clients/:id', requireAdmin, async (req,res)=>{
  try{
    const id = String(req.params.id);
    const patch = { id };
    if('display_name' in req.body) patch.display_name = req.body.display_name;
    if('sector' in req.body) patch.sector = req.body.sector;
    if('openrouter_model' in req.body) patch.openrouter_model = req.body.openrouter_model||null;
    if('openrouter_key' in req.body) patch.openrouter_key_enc = req.body.openrouter_key? enc(req.body.openrouter_key):null;
    if('business_prompt' in req.body) patch.business_prompt = req.body.business_prompt||null;
    if('channels' in req.body) patch.channels = Array.isArray(req.body.channels)? req.body.channels: [];
    if('telegram_token' in req.body){ patch.tg_bot_token_enc = req.body.telegram_token? enc(req.body.telegram_token):null; patch.tg_status = req.body.telegram_token?'ready':'idle'; }
    await upsertClient(patch);
    res.json({ ok:true });
  }catch(e){ console.error(e); res.status(500).json({ ok:false, error:'update_failed' }); }
});

// حذف عميل بالكامل
router.delete('/api/admin/clients/:id', requireAdmin, async (req,res)=>{
  try{ await deleteClientFull(String(req.params.id)); res.json({ ok:true }); }
  catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});

// توليد QR واتساب (رابط صورة مؤقت)
router.post('/api/admin/clients/:id/waweb/qr-session', requireAdmin, async (req,res)=>{
  try{
    const client_id = String(req.params.id);
    const ttl = Number(req.body?.ttl_minutes||10)||10;
    const max_uses = Number(req.body?.max_uses||1)||1;
    const tok = uuid().replace(/-/g,'');
    const expires_at = new Date(Date.now() + ttl*60*1000).toISOString();
    await newToken({ type:'waweb_qr', client_id, token:tok, max_uses, expires_at, created_by:req.user.uid });
    const url = `${process.env.PUBLIC_BASE}/waweb/${tok}/qr.png`;
    res.json({ ok:true, url, ttl, max_uses });
  }catch(e){ console.error(e); res.status(500).json({ ok:false, error:'qr_failed' }); }
});

// توليد رابط إنستغرام مؤقت
router.post('/api/admin/clients/:id/instagram/link', requireAdmin, async (req,res)=>{
  try{
    const client_id = String(req.params.id);
    const ttl = Number(req.body?.ttl_minutes||30)||30;
    const tok = uuid().replace(/-/g,'');
    const expires_at = new Date(Date.now() + ttl*60*1000).toISOString();
    await newToken({ type:'ig_link', client_id, token:tok, max_uses:1, expires_at, created_by:req.user.uid });
    const url = `${process.env.PUBLIC_BASE}/connect/instagram/${tok}`;
    res.json({ ok:true, url, ttl });
  }catch(e){ console.error(e); res.status(500).json({ ok:false, error:'ig_failed' }); }
});

// إدارة الباقات
router.get('/api/admin/plans', requireAdmin, async (_req,res)=>{
  try{ const rows=await adminListPlans(); res.json({ ok:true, plans:rows }); }
  catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});
router.post('/api/admin/plans', requireAdmin, async (req,res)=>{
  try{ const saved=await upsertPlan(req.body||{}); res.json({ ok:true, plan:saved }); }
  catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});
router.patch('/api/admin/plans/:id', requireAdmin, async (req,res)=>{
  try{ const row=Object.assign({},req.body||{}, {id:req.params.id}); const saved=await upsertPlan(row); res.json({ ok:true, plan:saved }); }
  catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});
router.delete('/api/admin/plans/:id', requireAdmin, async (req,res)=>{
  try{ await deletePlan(req.params.id); res.json({ ok:true }); }
  catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});

// تحليلات
router.get('/api/admin/analytics/summary', requireAdmin, async (_req,res)=>{
  try{ const s=await analyticsSummary(); res.json({ ok:true, summary:s }); }
  catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});

module.exports = router;
