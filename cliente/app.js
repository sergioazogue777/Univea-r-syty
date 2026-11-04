const express = require('express');
const app = express();
const hbs = require('hbs');
const session = require('express-session');

if (!process.env.SESSION_SECRET) throw new Error('Falta SESSION_SECRET');
app.use(express.urlencoded({ extended: true }));
hbs.registerPartials(__dirname + '/vistas/parciales');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/vistas');
app.use(express.static('public'));
app.use('/', require('./cliente.js'));
const port = Number(process.env.PORT || 8081);
app.listen(port, () => console.log('Cliente escuchando en ' + port));
