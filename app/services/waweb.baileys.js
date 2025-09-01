// /src/app/services/waweb.baileys.js
// اختياري فقط إذا أردت استخدام Baileys أيضاً
const path = require('path');
const fs = require('fs');
const Pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const QR_STORE = new Map();
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function sessionsBase(){ const c=(process.env.SESSION_DIR||'').trim(); return c?path.resolve(c):path.join(__dirname,'sessions'); }

async function startWA(client, { onQR, onStatus } = {}) {
  const baseDir = sessionsBase(); ensureDir(baseDir);
  const base = path.join(baseDir, String(client.id)); ensureDir(base);

  const { state, saveCreds } = await useMultiFileAuthState(base);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: Pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.appropriate('Piaaz'),
    syncFullHistory: false
  });

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) { QR_STORE.set(String(client.id), { qr, at: Date.now() }); if (typeof onQR === 'function') onQR(qr); }
    if (connection === 'close') {
      if (typeof onStatus === 'function') onStatus({ state: 'closed' });
      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.status;
      if (code !== DisconnectReason.loggedOut) setTimeout(() => startWA(client, { onQR, onStatus }), 1500);
    } else if (connection === 'open') {
      if (typeof onStatus === 'function') onStatus({ state: 'open' });
    }
  });
  sock.ev.on('creds.update', async () => { try { await saveCreds(); } catch {} });
  return sock;
}
function getCurrentQR(clientId){ return QR_STORE.get(String(clientId))?.qr || null; }
module.exports = { startWA, getCurrentQR };
