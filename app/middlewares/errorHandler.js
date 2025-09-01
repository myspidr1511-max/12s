// /src/app/middlewares/errorHandler.js
module.exports = function errorHandler(err, _req, res, _next){
  console.error('UNCAUGHT_ERR', err);
  return res.status(500).json({ ok:false, error:'server_error' });
};
