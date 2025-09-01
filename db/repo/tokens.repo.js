// /src/db/repo/tokens.repo.js
const { supabase } = require('../supabase');

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
  const { data, error } = await supabase.rpc('increment_token_use', { tok: token });
  if(error){
    const { data: t } = await supabase.from('tokens').select('*').eq('token', token).maybeSingle();
    if(!t) return null;
    const { data: t2 } = await supabase.from('tokens').update({ used_count: (t.used_count||0)+1 }).eq('token', token).select().maybeSingle();
    return t2;
  }
  return data;
}
module.exports = { newToken, getToken, useToken };
