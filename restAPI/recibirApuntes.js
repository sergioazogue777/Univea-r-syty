const express = require("express")
const router = express.Router()
const db = require('./firebase.js');

router.post("/", async (req, res) => {
    apuntes = []
    const asignatura = req.body.asignatura
    await db.collection("apuntes").where("asignatura", "==", asignatura).get().then(docs => {
        docs.forEach(doc => {
            const apunte = doc.data();
            apunte.id = doc.id;
            apuntes.push(apunte);
        })
    })
    res.status(200).send({ status: "ok", apuntes })

})

module.exports = router