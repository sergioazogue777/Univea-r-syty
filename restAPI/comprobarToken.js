const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ status: 'error', message: 'Token requerido' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ status: 'error', message: 'Configuración de autenticación incompleta' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.id = payload.foo;
    return next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Token inválido o caducado' });
  }
};
