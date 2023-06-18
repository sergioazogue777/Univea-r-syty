const express=require("express")
const router=express.Router()
const db = require('./firebase.js');

router.post("/",async (req,res)=>{
    let validado=true
    
    db.collection("usuarios").where("correo","==",req.body.usuario.correo).get().then(async docs=>{
        await docs.forEach(doc=>{
            if(doc.data().correo==req.body.usuario.correo){
                validado=false
            }
        })
        console.log(validado)
        if(validado){
            await db.collection('usuarios').doc().set({ correo: req.body.usuario.correo, contrasenya: req.body.usuario.contrasenya, nombre: req.body.usuario.nombre, apellidos: req.body.usuario.apellidos, nacimiento: req.body.usuario.nacimiento,esProfesor:false})
            res.status(200).send({status:"ok",nombre:req.body.nombre})
        }else{
            res.status(200).send({status:"error",info:"Correo ya en uso"})
        }
    }) 
    
})

module.exports = router