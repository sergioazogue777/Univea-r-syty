const express = require("express")
const router = express.Router()
const db = require('./firebase.js');

router.post("/", (req, res) => {
    const idApunte = req.body.idApunte
    var apunte
    db.collection("apuntes").doc(idApunte).get().then(doc => {
        apunte=doc.data()
        apunte.id=idApunte
        res.status(200).send({ status: "ok", apunte })
    }).catch((error) => {
        console.log("Error al buscar el documento:", error);
        res.status(200).send({ status: "No encontrado"})
    });

})

module.exports = router