// /src/db/repo/users.repo.js
const { supabase } = require('../supabase');

async function createAdminIfMissing(email, password_hash){
  const { data, error } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if(error) throw error;
  if(!data){
    const { error: e2 } = await supabase.from('users').insert({ email, password_hash, role:'admin' });
    if(e2) throw e2;
  }
}
async function getUserByEmail(email){
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if(error) throw error;
  return data;
}
async function updateUserById(id, patch){
  const { data, error } = await supabase.from('users').update(patch).eq('id', id).select().maybeSingle();
  if(error) throw error; return data;
}
async function insertUser(row){
  const { data, error } = await supabase.from('users').insert(row).select().maybeSingle();
  if(error) throw error; return data;
}

module.exports = { createAdminIfMissing, getUserByEmail, updateUserById, insertUser };
