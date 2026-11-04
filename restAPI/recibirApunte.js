const express = require('express');
const router = express.Router();
const db = require('./firebase.js');

router.post('/', async (req, res) => {
  const id = req.body?.idApunte;
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
    return res.status(400).json({ status: 'error', message: 'ID no válido' });
  }
  try {
    const doc = await db.collection('apuntes').doc(id).get();
    if (!doc.exists) return res.status(404).json({ status: 'error', message: 'Apunte no encontrado' });
    return res.json({ status: 'ok', apunte: { ...doc.data(), id: doc.id } });
  } catch (error) {
    console.error('Error al recuperar apunte:', error.message);
    return res.status(500).json({ status: 'error' });
  }
});
module.exports = router;
