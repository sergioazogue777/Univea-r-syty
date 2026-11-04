const express = require('express');
const router = express.Router();
const db = require('./firebase.js');
const jwt = require('jsonwebtoken');
const { hashPassword, verifyPassword } = require('./passwords');

router.post('/', async (req, res) => {
  const usuario = req.body?.usuario;
  if (typeof usuario?.correo !== 'string' || typeof usuario?.contrasenya !== 'string' ||
      !usuario.correo.trim() || !usuario.contrasenya) {
    return res.status(400).json({ status: 'error', message: 'Correo y contraseña obligatorios' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ status: 'error', message: 'JWT_SECRET sin configurar' });
  }
  try {
    const docs = await db.collection('usuarios').where('correo', '==', usuario.correo).limit(1).get();
    if (docs.empty) return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
    const doc = docs.docs[0];
    const stored = doc.data();
    const password = await verifyPassword(usuario.contrasenya, stored.contrasenya);
    if (!password.valid) return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
    if (password.legacy) {
      // Existing academic accounts migrate on successful login without forcing password resets.
      await doc.ref.update({ contrasenya: await hashPassword(usuario.contrasenya) });
    }
    const token = jwt.sign({ foo: doc.id }, process.env.JWT_SECRET, { expiresIn: '2h', algorithm: 'HS256' });
    return res.status(200).json({ status: 'ok', token, nombre: stored.nombre, esProfesor: stored.esProfesor });
  } catch (error) {
    console.error('Error al autenticar:', error.message);
    return res.status(500).json({ status: 'error', message: 'Error interno de autenticación' });
  }
});

module.exports = router;
