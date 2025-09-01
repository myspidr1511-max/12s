// /src/utils/logger.js
// تقدر تستبدله بـ pino لاحقًا
module.exports = {
  info: (...a)=>console.log('[INFO]', ...a),
  warn: (...a)=>console.warn('[WARN]', ...a),
  error: (...a)=>console.error('[ERR ]', ...a),
};
