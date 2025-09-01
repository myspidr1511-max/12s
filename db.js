const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY
);

// users
async function createAdminIfMissing(email, password_hash){
  const { data } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if(!data){
    await supabase.from('users').insert({ email, password_hash, role:'admin' });
  }
}
async function getUserByEmail(email){
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if(error) throw error; return data;
}
async function insertUser(row){
  const { data, error } = await supabase.from('users').insert(row).select().maybeSingle();
  if(error) throw error; return data;
}
async function updateUserById(id, patch){
  const { data, error } = await supabase.from('users').update(patch).eq('id', id).select().maybeSingle();
  if(error) throw error; return data;
}

// clients
async function upsertClient(row){
  row.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('clients').upsert(row).select().maybeSingle();
  if(error) throw error; return data;
}
async function getClient(id){
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  if(error) throw error; return data;
}
async function listClients(){
  const { data:cs, error } = await supabase.from('clients').select('*').order('created_at',{ascending:false});
  if(error) throw error;
  const { data:us } = await supabase.from('users').select('email,client_id');
  const map = Object.fromEntries((us||[]).filter(u=>u.client_id).map(u=>[u.client_id,u.email]));
  (cs||[]).forEach(c=>{ c.email = map[c.id] || null; });
  return cs||[];
}
async function deleteClientFull(id){
  await supabase.from('users').delete().eq('client_id', id);
  await supabase.from('tokens').delete().eq('client_id', id);
  await supabase.from('clients').delete().eq('id', id);
}

// tokens
async function newToken({ type, client_id, token, max_uses, expires_at, created_by }){
  const { data, error } = await supabase.from('tokens')
    .insert({ type, client_id, token, max_uses, expires_at, created_by })
    .select().maybeSingle();
  if(error) throw error; return data;
}
async function getToken(token){
  const { data, error } = await supabase.from('tokens').select('*').eq('token', token).maybeSingle();
  if(error) throw error; return data;
}
async function useToken(token){
  try{
    const { data } = await supabase.rpc('increment_token_use', { tok: token });
    return data;
  }catch{
    const { data: t } = await supabase.from('tokens').select('*').eq('token', token).maybeSingle();
    if(!t) return null;
    const { data: t2 } = await supabase.from('tokens').update({ used_count:(t.used_count||0)+1 }).eq('token', token).select().maybeSingle();
    return t2;
  }
}

// plans
async function publicPlans(){
  const { data, error } = await supabase.from('plans')
    .select('id,title,description,price,currency,period,image_url,channels,sort,is_active')
    .eq('is_active', true).order('sort',{ascending:true});
  if(error) throw error; return data||[];
}
async function adminListPlans(){
  const { data, error } = await supabase.from('plans').select('*').order('sort',{ascending:true});
  if(error) throw error; return data||[];
}
async function upsertPlan(row){
  row.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('plans').upsert(row).select().maybeSingle();
  if(error) throw error; return data;
}
async function deletePlan(id){
  await supabase.from('plans').delete().eq('id', id);
}

// analytics
async function addEvent(row){
  await supabase.from('events').insert(row);
}
async function analyticsSummary(){
  const { data: clients } = await supabase.from('clients').select('wa_status,ig_status,tg_status');
  const { data: plans }   = await supabase.from('plans').select('id');
  const totalClients = (clients||[]).length;
  const waActive = (clients||[]).filter(c=>['open','ready'].includes(c.wa_status)).length;
  const igActive = (clients||[]).filter(c=>['open','ready'].includes(c.ig_status)).length;
  const tgActive = (clients||[]).filter(c=>['open','ready'].includes(c.tg_status)).length;
  return { totalClients, waActive, igActive, tgActive, totalPlans:(plans||[]).length };
}

module.exports = {
  supabase,
  // users
  createAdminIfMissing, getUserByEmail, insertUser, updateUserById,
  // clients/tokens
  upsertClient, getClient, listClients, deleteClientFull,
  newToken, getToken, useToken,
  // plans
  publicPlans, adminListPlans, upsertPlan, deletePlan,
  // analytics
  addEvent, analyticsSummary
};
