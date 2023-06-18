const express=require("express")
const app=express()
const hbs=require("hbs")
const bodyParser=require("body-parser")
const session =require("express-session")
app.use(bodyParser.urlencoded({extended:true}))
hbs.registerPartials(__dirname+"/vistas/parciales",(err)=>{
})
app.use(session({
    secret:"encriptar",
    resave:true,
    saveUninitialized:false
}))
app.set("view engine","hbs")

app.set("views",__dirname+"/vistas")

app.use(express.static("public"))
app.use("/",require("./cliente.js"))

app.listen(8081,()=>{
    console.log("ejecutando")
})