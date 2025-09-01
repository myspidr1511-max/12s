// /src/db/repo/plans.repo.js
const { supabase } = require('../supabase');

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
module.exports = { publicPlans, adminListPlans, upsertPlan, deletePlan };
