const jwt = require('jsonwebtoken');

function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    const err = new Error('JWT_SECRET sin configurar');
    err.statusCode = 500;
    throw err;
  }
  if (typeof token !== 'string' || !token.trim()) {
    const err = new Error('Token requerido');
    err.statusCode = 401;
    throw err;
  }
  try {
    return jwt.verify(token.replace(/^Bearer\s+/i, '').trim(), process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (_) {
    const err = new Error('Token inválido o caducado');
    err.statusCode = 401;
    throw err;
  }
}
function middleware(req, res, next) {
  try {
    const payload = verifyToken(req.headers.authorization);
    if (!payload.foo) return res.status(401).json({ status: 'error', message: 'Token sin usuario' });
    req.id = payload.foo;
    next();
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
  }
}
module.exports = { verifyToken, middleware };
