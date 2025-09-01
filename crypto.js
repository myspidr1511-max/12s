const crypto = require('crypto');
const ALGO = 'aes-256-gcm';
const IV_LEN = 12;

function key32(){
  const raw = process.env.CRYPTO_SECRET || 'dev_secret';
  return crypto.createHash('sha256').update(raw).digest();
}
function enc(plain){
  if(plain==null) return null;
  const iv = crypto.randomBytes(IV_LEN);
  const c = crypto.createCipheriv(ALGO, key32(), iv);
  const encd = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  const tag = c.getAuthTag();
  return Buffer.concat([Buffer.from('v1.'), iv, tag, encd]).toString('base64');
}
function dec(b64){
  if(!b64) return null;
  const buf = Buffer.from(b64, 'base64');
  if(buf.slice(0,3).toString() !== 'v1.') return null;
  const body = buf.slice(3);
  const iv = body.slice(0,IV_LEN);
  const tag = body.slice(IV_LEN, IV_LEN+16);
  const data = body.slice(IV_LEN+16);
  const d = crypto.createDecipheriv(ALGO, key32(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString('utf8');
}
module.exports = { enc, dec };
