const express = require("express")
const router = express.Router()
const db = require('./firebase.js');

router.post("/",async (req, res) => {
    var profesores = []
    const asignatura = req.body.asignatura
    await db.collection("profesores").where("asignatura", "==", asignatura).get().then(docs => {
        docs.forEach(doc => {
                const profesor = doc.data()
                profesor.id=doc.id
                profesores.push(profesor)
        })
    }).catch(err => {
        console.log(err)
        res.status(500).send({ status: "err"})
    })
    res.status(200).send({ status: "ok", profesores })

})

module.exports = router