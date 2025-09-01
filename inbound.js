const { generateReply } = require('./llm');
const { addEvent } = require('./db');

async function handleInbound({ clientId, text, channel, senderName, senderId }){
  if(!text?.trim()) return null;
  try{
    await addEvent({ type:'msg_in', client_id:clientId, data:{ channel, senderId } });
    const reply = await generateReply(clientId, text.trim(), { channel, name:senderName, userId:senderId });
    await addEvent({ type:'msg_out', client_id:clientId, data:{ channel, senderId } });
    return reply;
  }catch(e){
    console.error('AI_ERROR', e?.message || e);
    return 'خلل مؤقت في المساعد. حاول لاحقًا 🙏';
  }
}
module.exports = { handleInbound };
