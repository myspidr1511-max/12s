// /src/app/routes/public.routes.js
const express = require('express');
const router = express.Router();
const { publicPlans } = require('../../db/repo/plans.repo');

// GET plans
router.get('/api/public/plans', async (_req,res)=>{
  try{
    const plans = await publicPlans();
    return res.json({ ok:true, plans });
  }catch(e){ console.error(e); return res.status(500).json({ ok:false }); }
});

// GET support links (WhatsApp / Instagram DM shell)
router.get('/api/public/support-links', async (req,res)=>{
  const to = encodeURIComponent(req.query.message || 'السلام عليكم، مهتم بإحدى الباقات.');
  const whatsapp = `https://wa.me/?text=${to}`;
  const instagram = `https://www.instagram.com/direct/t/`;
  return res.json({ ok:true, whatsapp, instagram });
});

module.exports = router;
