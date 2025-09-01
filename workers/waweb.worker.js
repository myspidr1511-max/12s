// /workers/waweb.worker.js
require('dotenv').config?.();
const { bootAll } = require('../src/app/services/waweb.manager');
(async ()=>{
  console.log('[Worker] Booting WhatsApp sessions…');
  await bootAll();
})();
