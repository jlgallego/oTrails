// Middleware para loguear cabeceras de petición HTTP para depuración
function logRequestHeaders(req, res, next) {
  console.log('Request Headers:', req.headers);
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.originalUrl);
  next();
}