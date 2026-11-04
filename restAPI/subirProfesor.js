const express = require('express');
const router = express.Router();
const db = require('./firebase.js');
const { verifyToken } = require('./auth');

router.post('/', async (req, res) => {
  const profesor = req.body?.profesor;
  let id;
  try { id = verifyToken(profesor?.persona).foo; }
  catch (error) { return res.status(error.statusCode || 500).json({ status: 'error', message: error.message }); }
  if (!profesor || typeof profesor.asignatura !== 'string' || !profesor.asignatura.trim()) {
    return res.status(400).json({ status: 'error', message: 'Falta asignatura' });
  }
  try {
    const userRef = db.collection('usuarios').doc(id);
    const user = await userRef.get();
    if (!user.exists) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    const { nombre, apellidos } = user.data();
    const doc = await db.collection('profesores').add({
      nombre, apellidos,
      asignatura: profesor.asignatura,
      ciudad: profesor.ciudad || '',
      descripcion: profesor.descripcion || '',
      email: profesor.email || '',
      online: Boolean(profesor.online),
      telefono: profesor.telefono || ''
    });
    await userRef.update({ esProfesor: true });
    return res.status(201).json({ status: 'ok', nombreFoto: doc.id, esProfesor: true });
  } catch (error) {
    console.error('Error al registrar profesor:', error.message);
    return res.status(500).json({ status: 'error', message: 'Error interno' });
  }
});
module.exports = router;
