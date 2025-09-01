// /src/app/services/inbound.service.js
const { generateReply } = require('./llm.service');
const { addEvent } = require('../../db/repo/analytics.repo');

async function handleInbound({ clientId, text, channel, senderName, senderId, sector }){
  if(!text?.trim()) return null;
  try{
    await addEvent({ type:'msg_in', client_id:clientId, data:{channel,senderId} });
    const reply = await generateReply(clientId, text.trim(), { channel, name:senderName, userId:senderId, sector });
    await addEvent({ type:'msg_out', client_id:clientId, data:{channel,senderId} });
    return reply;
  }catch(e){
    console.error('AI_ERROR', e?.message || e);
    return 'خلل مؤقت في المساعد. حاول لاحقًا 🙏';
  }
}
module.exports={ handleInbound };
