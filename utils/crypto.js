// /src/utils/crypto.js
const crypto = require('crypto');
function key32(){
  const raw = (process.env.CRYPTO_SECRET || 'dev_secret_for_localonly');
  return crypto.createHash('sha256').update(raw).digest(); // 32 bytes
}
const ALGO='aes-256-gcm', IV_LEN=12;
function enc(plain){
  if(plain==null) return null;
  const iv = crypto.randomBytes(IV_LEN);
  const key=key32();
  const c = crypto.createCipheriv(ALGO,key,iv);
  const encd = Buffer.concat([c.update(String(plain),'utf8'), c.final()]);
  const tag = c.getAuthTag();
  return Buffer.concat([Buffer.from('v1.'), iv, tag, encd]).toString('base64');
}
function dec(b64){
  if(!b64) return null;
  const buf=Buffer.from(b64,'base64');
  if(buf.slice(0,3).toString()!=='v1.') return null;
  const rest=buf.slice(3);
  const iv=rest.slice(0,IV_LEN), tag=rest.slice(IV_LEN,IV_LEN+16), encd=rest.slice(IV_LEN+16);
  const d=crypto.createDecipheriv(ALGO,key32(),iv); d.setAuthTag(tag);
  return Buffer.concat([d.update(encd), d.final()]).toString('utf8');
}
module.exports={enc,dec};
