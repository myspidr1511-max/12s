const express = require('express');
const router = express.Router();
const { publicPlans } = require('./db');

router.get('/api/public/health', (_req,res)=>res.json({ok:true, up:true}));

router.get('/api/public/plans', async (_req,res)=>{
  try{ const plans=await publicPlans(); return res.json({ok:true, plans}); }
  catch(e){ console.error(e); return res.status(500).json({ok:false}); }
});

// زر شراء -> روابط دعم
router.get('/api/public/support-links', async (req,res)=>{
  const to = encodeURIComponent(req.query.message || 'السلام عليكم، مهتم بإحدى الباقات.');
  const whatsapp  = `https://wa.me/?text=${to}`;
  const instagram = `https://www.instagram.com/direct/t/`;
  return res.json({ ok:true, whatsapp, instagram });
});

module.exports = router;
