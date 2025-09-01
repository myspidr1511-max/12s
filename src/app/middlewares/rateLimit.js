// /src/app/middlewares/rateLimit.js
// بسيط في الذاكرة لكل IP: 100 طلب / 5 دقائق
const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 100;
const store = new Map(); // ip -> { count, resetAt }

module.exports = function rateLimit(req,res,next){
  const ip = (req.headers['x-forwarded-for']||req.connection.remoteAddress||'unknown').toString();
  const now = Date.now();
  let entry = store.get(ip);
  if(!entry || entry.resetAt <= now){
    entry = { count:1, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
    return next();
  }
  if(entry.count >= LIMIT){
    res.setHeader('Retry-After', Math.max(0, Math.ceil((entry.resetAt-now)/1000)));
    return res.status(429).json({ ok:false, error:'rate_limited' });
  }
  entry.count++;
  next();
};
