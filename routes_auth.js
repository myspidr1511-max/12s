const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const { sign, verifyPassword, requireAuth, requireRole } = require('./auth');
const { createAdminIfMissing, updateUserById } = require('./db');

// Bootstrap أول أدمن
router.post('/bootstrap/create-admin', async (req,res)=>{
  try{
    const { email, password } = req.body||{};
    if(!email || !password) return res.status(400).json({ok:false,error:'missing'});
    const hash = await argon2.hash(password);
    await createAdminIfMissing(email, hash);
    res.json({ ok:true });
  }catch(e){ console.error(e); res.status(500).json({ok:false}); }
});

// Login
router.post('/api/auth/login', async (req,res)=>{
  try{
    const { email, password } = req.body||{};
    const u = await verifyPassword(email, password);
    if(!u) return res.status(401).json({ ok:false, error:'invalid' });
    const token = sign(u);
    res.json({ ok:true, token, user:{ id:u.id, role:u.role, client_id:u.client_id||null, email:u.email } });
  }catch(e){ console.error(e); res.status(500).json({ok:false}); }
});

// تعديل مستخدم (أدمن فقط)
router.patch('/api/admin/users/:id', [requireAuth, requireRole('admin')], async (req,res)=>{
  try{
    const patch = {};
    if(req.body.email) patch.email = req.body.email;
    if(req.body.password) patch.password_hash = await argon2.hash(req.body.password);
    const u = await updateUserById(req.params.id, patch);
    res.json({ ok:true, user:{ id:u.id, email:u.email, role:u.role } });
  }catch(e){ console.error(e); res.status(500).json({ ok:false }); }
});

module.exports = router;
