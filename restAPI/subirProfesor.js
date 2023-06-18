const express = require("express")
const router = express.Router()
const db = require('./firebase.js');
const jwt = require('jsonwebtoken');

router.post("/", async (req, res) => {
    const profesor=req.body.profesor
    const profesorID = jwt.verify(profesor.persona, "joaquin").foo
    var datosPersonales
    const docRef = await db.collection('profesores').doc();
    const docID=docRef.id
    await db.collection('usuarios').doc(profesorID).get().then(doc=>{
        datosPersonales=doc.data()
    }).catch(error=>{
        console.log(error)
    })
    await db.collection('usuarios').doc(profesorID).update({
        esProfesor:true
    }).catch(error=>{
        console.log(error)
    })
    profesor.nombre=datosPersonales.nombre
    profesor.apellidos=datosPersonales.apellidos

    await docRef.set({apellidos:profesor.apellidos,asignatura:profesor.asignatura,ciudad:profesor.ciudad,descripcion:profesor.descripcion,email:profesor.email,nombre:profesor.nombre,online:profesor.online,telefono:profesor.telefono});

    res.status(200).send({status:"ok",nombreFoto:docID,esProfesor:true})

})

module.exports = router