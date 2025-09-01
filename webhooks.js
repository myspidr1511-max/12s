const express = require('express');
const router = express.Router();

router.get('/webhook/instagram', (req,res)=>{
  const verify = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if(verify && challenge && verify===process.env.META_VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.status(403).end();
});

router.post('/webhook/instagram', (req,res)=>{
  console.log('IG webhook event:', JSON.stringify(req.body));
  res.status(200).end();
});

module.exports = router;
