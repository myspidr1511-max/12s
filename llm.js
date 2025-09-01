const fetch = require('node-fetch');
const { supabase } = require('./db');
const { dec } = require('./crypto');

const DEFAULT_MODEL = process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-3.5-turbo';
const FALLBACK_OR_KEY = process.env.OPENROUTER_API_KEY || '';

async function getClientConfig(clientId){
  const { data, error } = await supabase.from('clients')
    .select('id,display_name,sector,business_prompt,openrouter_model,openrouter_key_enc')
    .eq('id', clientId).maybeSingle();
  if(error) throw error; return data||null;
}
function buildMessages(prompt, userText, meta={}){
  const sys = prompt?.trim() || `أنت مساعد دعم فني محترف. جاوب بالعربية، وبحدود نطاق عمل العميل فقط.`;
  const ctx = [];
  if(meta.sector) ctx.push(`القطاع: ${meta.sector}`);
  if(meta.name) ctx.push(`المرسل: ${meta.name}`);
  if(meta.channel) ctx.push(`القناة: ${meta.channel}`);
  return [
    { role:'system', content: sys + (ctx.length?`\n\nسياق:\n- ${ctx.join('\n- ')}`:'') },
    { role:'user', content: userText }
  ];
}
async function chatWithOpenRouter({ model, apiKey, messages, temperature=0.4 }){
  const key = apiKey || FALLBACK_OR_KEY;
  if(!key) throw new Error('missing_openrouter_key');
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${key}`,
      'HTTP-Referer':process.env.PUBLIC_BASE||'https://example.com',
      'X-Title':'Piaaz AI'
    },
    body: JSON.stringify({ model, messages, temperature })
  });
  if(!r.ok){ const txt = await r.text().catch(()=> ''); throw new Error(`openrouter_${r.status}: ${txt}`); }
  const j = await r.json();
  return (j?.choices?.[0]?.message?.content || '').trim();
}
async function generateReply(clientId, text, meta={}){
  const cfg = await getClientConfig(clientId);
  if(!cfg) throw new Error('client_not_found');
  const model  = (cfg.openrouter_model || DEFAULT_MODEL).trim();
  const apiKey = cfg.openrouter_key_enc ? dec(cfg.openrouter_key_enc) : null;
  const messages = buildMessages(cfg.business_prompt, text, { ...meta, sector:cfg.sector });
  const reply = await chatWithOpenRouter({ model, apiKey, messages });
  return reply || 'تم ✅';
}
module.exports = { generateReply };
