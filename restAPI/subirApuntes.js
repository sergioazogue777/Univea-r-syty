const express = require("express")
const router = express.Router()
const db = require('./firebase.js');
const jwt = require('jsonwebtoken');

router.post("/", async (req, res) => {
    const autor = jwt.verify(req.body.autor, "joaquin");
    const nombreArchivo = req.body.nombreArchivo
    const docRef = await db.collection('apuntes').doc();
    const docId = docRef.id;
    const titulo=req.body.titulo
    const descripcion=req.body.descripcion
    const nombreAutor=req.body.nombreAutor

    await docRef.set({ autor:autor.foo,titulo,descripcion, nombreArchivo,asignatura:req.body.asignatura,nombreAutor });

    res.status(200).send({status:"ok",nombre:docId})

})

module.exports = router