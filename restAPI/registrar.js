const express = require('express');
const router = express.Router();
const db = require('./firebase.js');
const { hashPassword } = require('./passwords');

router.post('/', async (req, res) => {
  const usuario = req.body?.usuario;
  if (!usuario || !['correo', 'contrasenya', 'nombre', 'apellidos'].every(
    key => typeof usuario[key] === 'string' && usuario[key].trim()
  )) {
    return res.status(400).json({ status: 'error', info: 'Faltan datos obligatorios' });
  }
  if (usuario.contrasenya.length < 8) {
    return res.status(400).json({ status: 'error', info: 'La contraseña debe tener al menos 8 caracteres' });
  }
  const correo = usuario.correo.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ status: 'error', info: 'Correo no válido' });
  }
  try {
    const existing = await db.collection('usuarios').where('correo', '==', correo).limit(1).get();
    if (!existing.empty) return res.status(200).json({ status: 'error', info: 'Correo ya en uso' });
    await db.collection('usuarios').add({
      correo,
      contrasenya: await hashPassword(usuario.contrasenya),
      nombre: usuario.nombre.trim(),
      apellidos: usuario.apellidos.trim(),
      nacimiento: usuario.nacimiento || '',
      esProfesor: false
    });
    return res.status(201).json({ status: 'ok', nombre: usuario.nombre.trim() });
  } catch (error) {
    console.error('Error al registrar:', error.message);
    return res.status(500).json({ status: 'error', info: 'Error interno al registrar' });
  }
});
module.exports = router;
