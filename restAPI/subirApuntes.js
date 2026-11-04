const express = require('express');
const router = express.Router();
const db = require('./firebase.js');
const { verifyToken } = require('./auth');

router.post('/', async (req, res) => {
  let autor;
  try { autor = verifyToken(req.body?.autor).foo; }
  catch (error) { return res.status(error.statusCode || 500).json({ status: 'error', message: error.message }); }
  const { nombreArchivo, titulo, descripcion, asignatura, nombreAutor } = req.body || {};
  if (![nombreArchivo, titulo, asignatura].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ status: 'error', message: 'Datos del apunte incompletos' });
  }
  try {
    const ref = await db.collection('apuntes').add({ autor, nombreArchivo, titulo, descripcion: descripcion || '', asignatura, nombreAutor: nombreAutor || '' });
    return res.status(201).json({ status: 'ok', nombre: ref.id });
  } catch (error) {
    console.error('Error al subir apunte:', error.message);
    return res.status(500).json({ status: 'error', message: 'No se pudo guardar el apunte' });
  }
});
module.exports = router;
