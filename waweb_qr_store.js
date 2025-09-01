const cache = new Map(); // clientId -> { png, qr, ts }
function setQR(clientId, pngBuffer, qrString){ cache.set(String(clientId), { png:pngBuffer, qr:qrString, ts:Date.now() }); }
function getQRBufferForClient(clientId){ const v=cache.get(String(clientId)); return v? v.png : null; }
module.exports = { setQR, getQRBufferForClient };
