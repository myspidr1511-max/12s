const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { getUserByEmail } = require('./db');

function sign(user){
  return jwt.sign(
    { uid:user.id, role:user.role, client_id:user.client_id||null },
    process.env.JWT_SECRET,
    { expiresIn:'15d' }
  );
}
function requireAuth(req,res,next){
  const h=req.headers.authorization||'';
  const t=h.startsWith('Bearer ')?h.slice(7):null;
  if(!t) return res.status(401).json({ok:false, error:'unauthorized'});
  try{ req.user=jwt.verify(t, process.env.JWT_SECRET); next(); }
  catch{ return res.status(401).json({ok:false,error:'unauthorized'}); }
}
function requireRole(role){
  return (req,res,next)=>{
    if(!req.user || req.user.role!==role) return res.status(403).json({ok:false,error:'forbidden'});
    next();
  };
}
async function verifyPassword(email, password){
  const u = await getUserByEmail(email);
  if(!u) return null;
  const ok = await argon2.verify(u.password_hash, password);
  if(!ok) return null;
  return u;
}
module.exports={sign,requireAuth,requireRole,verifyPassword};
