const express = require('express');
const router = express.Router();
const db = require('./firebase.js');

router.post('/', async (req, res) => {
  const asignatura = req.body?.asignatura;
  if (typeof asignatura !== 'string' || !asignatura.trim()) {
    return res.status(400).json({ status: 'error', message: 'Asignatura obligatoria' });
  }
  try {
    const docs = await db.collection('profesores').where('asignatura', '==', asignatura).get();
    const profesores = docs.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return res.json({ status: 'ok', profesores });
  } catch (error) {
    console.error('Error al recuperar profesores:', error.message);
    return res.status(500).json({ status: 'error' });
  }
});
module.exports = router;
