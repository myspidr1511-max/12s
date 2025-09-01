// /src/db/repo/analytics.repo.js
const { supabase } = require('../supabase');

async function addEvent(row){
  await supabase.from('events').insert(row);
}
async function analyticsSummary(){
  const { data: clients } = await supabase.from('clients').select('id,channels,wa_status,ig_status,tg_status');
  const { data: plans } = await supabase.from('plans').select('id');
  const totalClients = (clients||[]).length;
  const waActive = (clients||[]).filter(c=>c.wa_status==='open' || c.wa_status==='ready').length;
  const igActive = (clients||[]).filter(c=>c.ig_status==='open' || c.ig_status==='ready').length;
  const tgActive = (clients||[]).filter(c=>c.tg_status==='ready').length;
  return { totalClients, waActive, igActive, tgActive, totalPlans:(plans||[]).length };
}
module.exports = { addEvent, analyticsSummary };
