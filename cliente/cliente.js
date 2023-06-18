const express = require("express")
const fs = require('fs')
const router = express.Router()
const axios = require('axios')
const path = require('path')
const multer = require('multer');
const descargar = require("./descargar.js")
var upload = multer({ dest: 'public/apuntes/' });

router.get("/", (req, res) => {
    if (req.session.token) {
        res.render("index", { registrado: req.session.nombre })
    } else {
        res.render("matematicas")
    }
})
router.get("/registrar", (req, res) => {
    res.render("registro")
})
router.post("/registrar", async (req, res) => {
    usuario = { correo: req.body.correo, contrasenya: req.body.contrasenya, nombre: req.body.nombre, apellidos: req.body.apellidos, nacimiento: req.body.nacimiento }
    await axios.post("http://localhost:2005/registrar", { usuario }).then(respuesta => {
        console.log(respuesta.data)
        if (respuesta.data.status == "error") {
            res.render("registro", { status: respuesta.data.info })
        } else {
            usuario = { correo: req.body.correo, contrasenya: req.body.contrasenya }
            axios.post("http://localhost:2005/validar", { usuario }).then(respuesta => {
                if (respuesta.data.token) {
                    req.session.token = respuesta.data.token
                    req.session.nombre = respuesta.data.nombre
                    res.redirect("/")
                } else {
                    res.render("login", { status: "Usuario no encontrado" })
                }
            })
        }
    })
})
router.get("/matematicas", (req, res) => {
    if (req.session.token) {
        res.render("matematicas", { registrado: req.session.nombre })

    } else {
        res.render("aviso")
    }
})
router.get("/matematicas/temario", (req, res) => {
    if (req.session.token) {
        if (req.query.archivo) {
            rutaArchivo = descargar(req.query.archivo)
            nombreDescarga = `${req.query.archivo}.pdf`
            res.download(rutaArchivo, nombreDescarga, (err) => {
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                }
            })
        } else {
            res.render("matematicasTemario", { registrado: req.session.nombre })

        }

    } else {
        res.render("aviso")
    }

})
router.get("/matematicas/comunidad", async (req, res) => {
    if (req.session.token) {
        if (req.query.apunte) {
            idApunte = req.query.apunte
            axios.post("http://localhost:2005/recibirApunte", { idApunte }).then(respuesta => {
                var apunte = respuesta.data.apunte
                rutaArchivo = path.join(__dirname, 'public', 'apuntes', apunte.id)
                res.download(rutaArchivo, apunte.nombreArchivo, (err) => {
                    if (err) {
                        console.error('Error al descargar el archivo:', err);
                    }
                })
            }).catch(err => {
                console.log(err)
                res.render("matematicasComunidad", { registrado: req.session.nombre, apuntes, err })
            })
        } else {
            var apuntes
            axios.post("http://localhost:2005/recibirApuntes", { asignatura: "matematicas" }).then(respuesta => {

                apuntes = respuesta.data.apuntes
                res.render("matematicasComunidad", { registrado: req.session.nombre, apuntes })
            }).catch(err => {
                res.render("matematicasComunidad", { registrado: req.session.nombre, apuntes, err })
            })
        }

    } else {
        res.render("aviso")
    }

})
router.post("/matematicas/comunidad", upload.single('archivo'), (req, res) => {
    if (req.session.token) {
        if (req.file) {
            const autor = req.session.token
            const nombreAutor = req.session.nombre
            const titulo = req.body.titulo
            const descripcion = req.body.descripcion
            const archivo = req.file;
            const nombreOriginal = archivo.originalname;
            const rutaArchivo = path.join(__dirname, 'public', 'apuntes', archivo.filename);
            axios.post("http://localhost:2005/subirApuntes", { autor, titulo, descripcion, nombreAutor, nombreArchivo: nombreOriginal, asignatura: "matematicas" }).then(respuesta => {
                const rutaArchivo2 = path.join(__dirname, 'public', 'apuntes', respuesta.data.nombre);
                fs.rename(rutaArchivo, rutaArchivo2, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error al guardar el archivo.');
                    } else {
                        res.redirect('/matematicas/comunidad');
                    }
                });
            })


        } else {
            res.status(400).send('No se encontró ningún archivo.');
        }
    } else {
        res.render("aviso")
    }

})
router.get("/matematicas/profesores", async (req, res) => {
    if (req.session.token) {

        var profesores
        axios.post("http://localhost:2005/recibirProfesores", { asignatura: "matematicas" }).then(respuesta => {

            profesores = respuesta.data.profesores
            console.log(req.session.esProfesor)
            res.render("matematicasProfesores", { registrado: req.session.nombre, profesores,esProfesor:req.session.esProfesor })
        }).catch(err => {
            console.log(err)
        })
    } else {
        res.render("aviso")
    }

})
router.post("/matematicas/profesores", upload.single('foto'), async (req, res) => {
    if (req.session.token) {
        var online = false
        if (req.body.online) {
            online = true
        }
        var profesor = { persona: req.session.token, telefono: req.body.telefono, ciudad: req.body.ciudad, email: req.body.email, descripcion: req.body.descripcion, online,asignatura:"matematicas" }
        const archivo = req.file;
        const rutaArchivo = path.join(__dirname, 'public',"apuntes", archivo.filename);
        axios.post("http://localhost:2005/subirProfesor", { profesor }).then(respuesta => {
            const rutaArchivo2 = path.join(__dirname, 'public', 'apuntes', respuesta.data.nombreFoto+".jpg");
            fs.rename(rutaArchivo, rutaArchivo2, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error al guardar el archivo.');
                } else {
                    req.session.esProfesor=true
                    res.redirect('/matematicas/profesores');
                }
            });
        })
    } else {
        res.render("aviso")
    }

})
router.get("/historia", (req, res) => {
    if (req.session.token) {
        res.render("historia", { registrado: req.session.nombre })

    } else {
        res.render("aviso")
    }
})
router.get("/historia/temario", (req, res) => {
    if (req.session.token) {
        if (req.query.archivo) {
            rutaArchivo = descargar(req.query.archivo)
            nombreDescarga = `${req.query.archivo}.pdf`
            res.download(rutaArchivo, nombreDescarga, (err) => {
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                }
            })
        } else {
            res.render("historiaTemario", { registrado: req.session.nombre })

        }

    } else {
        res.render("aviso")
    }

})
router.get("/historia/comunidad", async (req, res) => {
    if (req.session.token) {
        if (req.query.apunte) {
            idApunte = req.query.apunte
            axios.post("http://localhost:2005/recibirApunte", { idApunte }).then(respuesta => {
                var apunte = respuesta.data.apunte
                rutaArchivo = path.join(__dirname, 'public', 'apuntes', apunte.id)
                res.download(rutaArchivo, apunte.nombreArchivo, (err) => {
                    if (err) {
                        console.error('Error al descargar el archivo:', err);
                    }
                })
            }).catch(err => {
                console.log(err)
                res.render("historiaComunidad", { registrado: req.session.nombre, apuntes, err })
            })
        } else {
            var apuntes
            axios.post("http://localhost:2005/recibirApuntes", { asignatura: "historia" }).then(respuesta => {

                apuntes = respuesta.data.apuntes
                res.render("historiaComunidad", { registrado: req.session.nombre, apuntes })
            }).catch(err => {
                res.render("historiaComunidad", { registrado: req.session.nombre, apuntes, err })
            })
        }

    } else {
        res.render("aviso")
    }

})
router.post("/historia/comunidad", upload.single('archivo'), (req, res) => {
    if (req.session.token) {
        if (req.file) {
            const autor = req.session.token
            const nombreAutor = req.session.nombre
            const titulo = req.body.titulo
            const descripcion = req.body.descripcion
            const archivo = req.file;
            const nombreOriginal = archivo.originalname;
            const rutaArchivo = path.join(__dirname, 'public', 'apuntes', archivo.filename);
            axios.post("http://localhost:2005/subirApuntes", { autor, titulo, descripcion, nombreAutor, nombreArchivo: nombreOriginal, asignatura: "historia" }).then(respuesta => {
                const rutaArchivo2 = path.join(__dirname, 'public', 'apuntes', respuesta.data.nombre);
                fs.rename(rutaArchivo, rutaArchivo2, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error al guardar el archivo.');
                    } else {
                        res.redirect('/historia/comunidad');
                    }
                });
            })


        } else {
            res.status(400).send('No se encontró ningún archivo.');
        }
    } else {
        res.render("aviso")
    }

})
router.get("/historia/profesores", async (req, res) => {
    if (req.session.token) {

        var profesores
        axios.post("http://localhost:2005/recibirProfesores", { asignatura: "historia" }).then(respuesta => {

            profesores = respuesta.data.profesores
            console.log(req.session.esProfesor)
            res.render("historiaProfesores", { registrado: req.session.nombre, profesores,esProfesor:req.session.esProfesor })
        }).catch(err => {
            console.log(err)
        })
    } else {
        res.render("aviso")
    }

})
router.post("/historia/profesores", upload.single('foto'), async (req, res) => {
    if (req.session.token) {
        var online = false
        if (req.body.online) {
            online = true
        }
        var profesor = { persona: req.session.token, telefono: req.body.telefono, ciudad: req.body.ciudad, email: req.body.email, descripcion: req.body.descripcion, online,asignatura:"historia" }
        const archivo = req.file;
        const rutaArchivo = path.join(__dirname, 'public',"apuntes", archivo.filename);
        axios.post("http://localhost:2005/subirProfesor", { profesor }).then(respuesta => {
            const rutaArchivo2 = path.join(__dirname, 'public', 'apuntes', respuesta.data.nombreFoto+".jpg");
            fs.rename(rutaArchivo, rutaArchivo2, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error al guardar el archivo.');
                } else {
                    req.session.esProfesor=true
                    res.redirect('/historia/profesores');
                }
            });
        })
    } else {
        res.render("aviso")
    }

})
router.get("/fisica", (req, res) => {
    if (req.session.token) {
        res.render("fisica", { registrado: req.session.nombre })

    } else {
        res.render("aviso")
    }
})
router.get("/fisica/temario", (req, res) => {
    if (req.session.token) {
        if (req.query.archivo) {
            rutaArchivo = descargar(req.query.archivo)
            nombreDescarga = `${req.query.archivo}.pdf`
            res.download(rutaArchivo, nombreDescarga, (err) => {
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                }
            })
        } else {
            res.render("fisicaTemario", { registrado: req.session.nombre })

        }

    } else {
        res.render("aviso")
    }

})

router.get("/fisica/comunidad", async (req, res) => {
    if (req.session.token) {
        if (req.query.apunte) {
            idApunte = req.query.apunte
            axios.post("http://localhost:2005/recibirApunte", { idApunte }).then(respuesta => {
                var apunte = respuesta.data.apunte
                rutaArchivo = path.join(__dirname, 'public', 'apuntes', apunte.id)
                res.download(rutaArchivo, apunte.nombreArchivo, (err) => {
                    if (err) {
                        console.error('Error al descargar el archivo:', err);
                    }
                })
            }).catch(err => {
                console.log(err)
                res.render("fisicaComunidad", { registrado: req.session.nombre, apuntes, err })
            })
        } else {
            var apuntes
            axios.post("http://localhost:2005/recibirApuntes", { asignatura: "fisica" }).then(respuesta => {

                apuntes = respuesta.data.apuntes
                res.render("fisicaComunidad", { registrado: req.session.nombre, apuntes })
            }).catch(err => {
                res.render("fisicaComunidad", { registrado: req.session.nombre, apuntes, err })
            })
        }

    } else {
        res.render("aviso")
    }

})
router.post("/fisica/comunidad", upload.single('archivo'), (req, res) => {
    if (req.session.token) {
        if (req.file) {
            const autor = req.session.token
            const nombreAutor = req.session.nombre
            const titulo = req.body.titulo
            const descripcion = req.body.descripcion
            const archivo = req.file;
            const nombreOriginal = archivo.originalname;
            const rutaArchivo = path.join(__dirname, 'public', 'apuntes', archivo.filename);
            axios.post("http://localhost:2005/subirApuntes", { autor, titulo, descripcion, nombreAutor, nombreArchivo: nombreOriginal, asignatura: "fisica" }).then(respuesta => {
                const rutaArchivo2 = path.join(__dirname, 'public', 'apuntes', respuesta.data.nombre);
                fs.rename(rutaArchivo, rutaArchivo2, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error al guardar el archivo.');
                    } else {
                        res.redirect('/fisica/comunidad');
                    }
                });
            })


        } else {
            res.status(400).send('No se encontró ningún archivo.');
        }
    } else {
        res.render("aviso")
    }

})
router.get("/fisica/profesores", async (req, res) => {
    if (req.session.token) {

        var profesores
        axios.post("http://localhost:2005/recibirProfesores", { asignatura: "fisica" }).then(respuesta => {

            profesores = respuesta.data.profesores
            console.log(req.session.esProfesor)
            res.render("fisicaProfesores", { registrado: req.session.nombre, profesores,esProfesor:req.session.esProfesor })
        }).catch(err => {
            console.log(err)
        })
    } else {
        res.render("aviso")
    }

})
router.post("/fisica/profesores", upload.single('foto'), async (req, res) => {
    if (req.session.token) {
        var online = false
        if (req.body.online) {
            online = true
        }
        var profesor = { persona: req.session.token, telefono: req.body.telefono, ciudad: req.body.ciudad, email: req.body.email, descripcion: req.body.descripcion, online,asignatura:"fisica" }
        const archivo = req.file;
        const rutaArchivo = path.join(__dirname, 'public',"apuntes", archivo.filename);
        axios.post("http://localhost:2005/subirProfesor", { profesor }).then(respuesta => {
            const rutaArchivo2 = path.join(__dirname, 'public', 'apuntes', respuesta.data.nombreFoto+".jpg");
            fs.rename(rutaArchivo, rutaArchivo2, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error al guardar el archivo.');
                } else {
                    req.session.esProfesor=true
                    res.redirect('/fisica/profesores');
                }
            });
        })
    } else {
        res.render("aviso")
    }

})

router.get("/castellano", (req, res) => {
    if (req.session.token) {
        res.render("castellano", { registrado: req.session.nombre })

    } else {
        res.render("aviso")
    }
})
router.get("/castellano/temario", (req, res) => {
    if (req.session.token) {
        if (req.query.archivo) {
            rutaArchivo = descargar(req.query.archivo)
            nombreDescarga = `${req.query.archivo}.pdf`
            res.download(rutaArchivo, nombreDescarga, (err) => {
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                }
            })
        } else {
            res.render("castellanoTemario", { registrado: req.session.nombre })

        }

    } else {
        res.render("aviso")
    }

})
router.get("/castellano/comunidad", async (req, res) => {
    if (req.session.token) {
        if (req.query.apunte) {
            idApunte = req.query.apunte
            axios.post("http://localhost:2005/recibirApunte", { idApunte }).then(respuesta => {
                var apunte = respuesta.data.apunte
                rutaArchivo = path.join(__dirname, 'public', 'apuntes', apunte.id)
                res.download(rutaArchivo, apunte.nombreArchivo, (err) => {
                    if (err) {
                        console.error('Error al descargar el archivo:', err);
                    }
                })
            }).catch(err => {
                console.log(err)
                res.render("castellanoComunidad", { registrado: req.session.nombre, apuntes, err })
            })
        } else {
            var apuntes
            axios.post("http://localhost:2005/recibirApuntes", { asignatura: "castellano" }).then(respuesta => {

                apuntes = respuesta.data.apuntes
                res.render("castellanoComunidad", { registrado: req.session.nombre, apuntes })
            }).catch(err => {
                res.render("castellanoComunidad", { registrado: req.session.nombre, apuntes, err })
            })
        }

    } else {
        res.render("aviso")
    }

})
router.post("/castellano/comunidad", upload.single('archivo'), (req, res) => {
    if (req.session.token) {
        if (req.file) {
            const autor = req.session.token
            const nombreAutor = req.session.nombre
            const titulo = req.body.titulo
            const descripcion = req.body.descripcion
            const archivo = req.file;
            const nombreOriginal = archivo.originalname;
            const rutaArchivo = path.join(__dirname, 'public', 'apuntes', archivo.filename);
            axios.post("http://localhost:2005/subirApuntes", { autor, titulo, descripcion, nombreAutor, nombreArchivo: nombreOriginal, asignatura: "castellano" }).then(respuesta => {
                const rutaArchivo2 = path.join(__dirname, 'public', 'apuntes', respuesta.data.nombre);
                fs.rename(rutaArchivo, rutaArchivo2, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error al guardar el archivo.');
                    } else {
                        res.redirect('/castellano/comunidad');
                    }
                });
            })


        } else {
            res.status(400).send('No se encontró ningún archivo.');
        }
    } else {
        res.render("aviso")
    }

})
router.get("/castellano/profesores", async (req, res) => {
    if (req.session.token) {

        var profesores
        axios.post("http://localhost:2005/recibirProfesores", { asignatura: "castellano" }).then(respuesta => {

            profesores = respuesta.data.profesores
            console.log(req.session.esProfesor)
            res.render("castellanoProfesores", { registrado: req.session.nombre, profesores,esProfesor:req.session.esProfesor })
        }).catch(err => {
            console.log(err)
        })
    } else {
        res.render("aviso")
    }

})
router.post("/castellano/profesores", upload.single('foto'), async (req, res) => {
    if (req.session.token) {
        var online = false
        if (req.body.online) {
            online = true
        }
        var profesor = { persona: req.session.token, telefono: req.body.telefono, ciudad: req.body.ciudad, email: req.body.email, descripcion: req.body.descripcion, online,asignatura:"castellano" }
        const archivo = req.file;
        const rutaArchivo = path.join(__dirname, 'public',"apuntes", archivo.filename);
        axios.post("http://localhost:2005/subirProfesor", { profesor }).then(respuesta => {
            const rutaArchivo2 = path.join(__dirname, 'public', 'apuntes', respuesta.data.nombreFoto+".jpg");
            fs.rename(rutaArchivo, rutaArchivo2, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error al guardar el archivo.');
                } else {
                    req.session.esProfesor=true
                    res.redirect('/castellano/profesores');
                }
            });
        })
    } else {
        res.render("aviso")
    }

})

router.get("/nosotros", (req, res) => {
    if (req.session.token) {
        res.render("nosotros", { registrado: req.session.nombre})
    } else {
        res.render("nosotros")
    }
})

router.post("/login", (req, res) => {
    usuario = { correo: req.body.correo, contrasenya: req.body.contrasenya }
    axios.post("http://localhost:2005/validar", { usuario }).then(respuesta => {
        if (respuesta.data.token) {
            req.session.token = respuesta.data.token
            req.session.nombre = respuesta.data.nombre
            req.session.esProfesor=respuesta.data.esProfesor
            res.redirect("/")
        } else {
            res.render("login", { status: "Usuario no encontrado" })
        }
    })
})

module.exports = router