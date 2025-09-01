// /src/app/services/waweb.manager.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { supabase } = require('../../db/supabase');
const { handleInbound } = require('./inbound.service');
const { setQR } = require('./waweb_qr_store');

const SESSIONS_DIR = path.join(process.cwd(), 'wa-sessions');
if(!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive:true });

async function bootWaClient(clientRow){
  const client = new Client({
    authStrategy: new LocalAuth({ clientId:String(clientRow.id), dataPath:SESSIONS_DIR }),
    puppeteer: { headless:true, args:['--no-sandbox','--disable-setuid-sandbox'] }
  });

  client.on('qr', async (qr)=>{
    try{
      const png = await qrcode.toBuffer(qr, { width:480 });
      setQR(clientRow.id, png, qr);
      console.log(`[WA ${clientRow.id}] QR ready`);
    }catch(e){ console.error('QR_ERR', e); }
  });

  client.on('ready', ()=> console.log(`[WA ${clientRow.id}] ready`));
  client.on('auth_failure', (m)=>console.error(`[WA ${clientRow.id}] auth_failure`, m));
  client.on('disconnected', (r)=>console.warn(`[WA ${clientRow.id}] disconnected`, r));

  client.on('message', async (msg)=>{
    try{
      if(msg.fromMe) return;
      const text = msg.body||'';
      const name = msg._data?.notifyName || msg._data?.pushname || '';
      const reply = await handleInbound({ clientId:clientRow.id, text, channel:'whatsapp', senderName:name, senderId:msg.from });
      if(reply) await msg.reply(reply);
    }catch(e){ console.error('WA_HANDLER_ERR', e); }
  });

  await client.initialize();
  return client;
}

async function bootAll(){
  const { data: clients, error } = await supabase.from('clients').select('*').eq('is_active', true);
  if(error) throw error;
  for(const c of (clients||[])){
    try{ await bootWaClient(c); }catch(e){ console.error('BOOT_CLIENT_ERR', c.id, e); }
  }
}

module.exports = { bootWaClient, bootAll };
