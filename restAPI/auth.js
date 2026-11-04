const jwt = require('jsonwebtoken');

function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET sin configurar');
    error.statusCode = 500;
    throw error;
  }
  if (typeof token !== 'string' || !token.trim()) {
    const error = new Error('Token requerido');
    error.statusCode = 401;
    throw error;
  }
  try {
    const payload = jwt.verify(token.replace(/^Bearer\s+/i, '').trim(), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!payload.foo) throw new Error('Token sin usuario');
    return payload;
  } catch {
    const error = new Error('Token inválido o caducado');
    error.statusCode = 401;
    throw error;
  }
}

function middleware(req, res, next) {
  try {
    req.id = verifyToken(req.headers.authorization).foo;
    next();
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
  }
}
module.exports = { verifyToken, middleware };
