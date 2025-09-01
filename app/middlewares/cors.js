// /src/app/middlewares/cors.js
const allow = (process.env.CORS_ALLOW||'').split(',').map(s=>s.trim()).filter(Boolean);

module.exports = function cors(req,res,next){
  const origin = req.headers.origin;
  if(!origin){ res.setHeader('Vary','Origin'); return next(); }
  if(allow.length===0 || allow.includes(origin)){
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Credentials','true');
    res.setHeader('Access-Control-Allow-Headers','authorization,content-type');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS');
    if(req.method==='OPTIONS') return res.status(204).end();
  }
  return next();
};
