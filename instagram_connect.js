const express = require('express');
const router = express.Router();
const { getToken } = require('./db');

router.get('/connect/instagram/:token', async (req,res)=>{
  try{
    const tok = await getToken(req.params.token);
    if(!tok || tok.type!=='ig_link') return res.status(404).send('Link invalid');
    if(new Date(tok.expires_at).getTime() < Date.now()) return res.status(410).send('Link expired');

    res.send(`
      <html dir="rtl"><head><meta charset="utf-8"><title>ربط إنستغرام</title>
      <style>body{font-family:system-ui;background:#0f2f3a;color:#fff;display:grid;place-items:center;height:100vh}
      .card{background:#124b58;border-radius:14px;padding:22px;max-width:560px;box-shadow:0 10px 40px rgba(0,0,0,.3)}
      a.btn{display:inline-block;background:#2cc2c2;color:#00343f;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:700}
      </style></head><body>
      <div class="card">
        <h2>ربط حساب إنستغرام</h2>
        <p>هذا الرابط مؤقت من قِبل الدعم. سيتم التواصل معك لإتمام الربط.</p>
        <p>رقم العميل: <b>${tok.client_id}</b></p>
        <a class="btn" href="https://wa.me/?text=${encodeURIComponent('مرحبا أريد ربط إنستغرام لعميل '+tok.client_id)}" target="_blank">تواصل واتساب</a>
      </div>
      </body></html>
    `);
  }catch(e){ console.error(e); res.status(500).send('Server error'); }
});

module.exports = router;
