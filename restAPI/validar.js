const express = require('express');
const router = express.Router();
const db = require('./firebase.js');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  const usuario = req.body?.usuario;
  if (typeof usuario?.correo !== 'string' || typeof usuario?.contrasenya !== 'string' ||
      !usuario.correo || !usuario.contrasenya) {
    return res.status(400).json({ status: 'error', message: 'Correo y contraseña obligatorios' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ status: 'error', message: 'Configuración de autenticación incompleta' });
  }
  try {
    const docs = await db.collection('usuarios').where('correo', '==', usuario.correo).get();
    let encontrado = null;
    docs.forEach(doc => {
      // Legacy password comparison; migrate stored passwords to a strong adaptive hash.
      if (doc.data().contrasenya === usuario.contrasenya) encontrado = { id: doc.id, data: doc.data() };
    });
    if (!encontrado) return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
    const token = jwt.sign({ foo: encontrado.id }, process.env.JWT_SECRET, { expiresIn: '2h', algorithm: 'HS256' });
    return res.status(200).json({ status: 'ok', token, nombre: encontrado.data.nombre, esProfesor: encontrado.data.esProfesor });
  } catch (error) {
    console.error('Error al validar usuario:', error.message);
    return res.status(500).json({ status: 'error', message: 'Error interno' });
  }
});
module.exports = router;
