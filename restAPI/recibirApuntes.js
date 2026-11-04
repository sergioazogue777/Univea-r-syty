const express = require('express');
const router = express.Router();
const db = require('./firebase.js');

router.post('/', async (req, res) => {
  const asignatura = req.body?.asignatura;
  if (typeof asignatura !== 'string' || !asignatura.trim()) {
    return res.status(400).json({ status: 'error', message: 'Asignatura obligatoria' });
  }
  try {
    const docs = await db.collection('apuntes').where('asignatura', '==', asignatura).get();
    const apuntes = docs.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return res.json({ status: 'ok', apuntes });
  } catch (error) {
    console.error('Error al recuperar apuntes:', error.message);
    return res.status(500).json({ status: 'error' });
  }
});
module.exports = router;
