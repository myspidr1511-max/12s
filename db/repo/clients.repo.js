// /src/db/repo/clients.repo.js
const { supabase } = require('../supabase');
const argon2 = require('argon2');
const { insertUser } = require('./users.repo');

async function upsertClient(row, opts={}){
  row.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('clients').upsert(row).select().maybeSingle();
  if(error) throw error;
  if(opts.createUser){
    const hash = await argon2.hash(opts.createUser.password);
    await insertUser({ email: opts.createUser.email, password_hash:hash, role: opts.createUser.role||'client', client_id:String(row.id) });
  }
  return data;
}
async function getClient(id){
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  if(error) throw error; return data;
}
async function listClients(){
  const { data:cs, error } = await supabase.from('clients').select('*').order('created_at', {ascending:false});
  if(error) throw error;
  const { data:us } = await supabase.from('users').select('email,client_id');
  const map = Object.fromEntries((us||[]).filter(u=>u.client_id).map(u=>[u.client_id,u.email]));
  (cs||[]).forEach(c=>{ c.email=map[c.id]||null; });
  return cs||[];
}
async function deleteClientFull(id){
  await supabase.from('users').delete().eq('client_id', id);
  await supabase.from('tokens').delete().eq('client_id', id);
  await supabase.from('clients').delete().eq('id', id);
}
async function getClientConfig(id){
  const { data, error } = await supabase.from('clients')
    .select('id,display_name,business_prompt,openrouter_model,openrouter_key_enc')
    .eq('id', id).maybeSingle();
  if(error) throw error; return data||null;
}
module.exports = { upsertClient, getClient, listClients, deleteClientFull, getClientConfig };
