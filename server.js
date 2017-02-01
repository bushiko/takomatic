// server.js
var express = require('express');
var app = module.exports = express();

var PORT = 3000;

app.use(express.static('./'));
app.listen(PORT);

console.log('Servidor iniciado. Escuchando en puerto ' + PORT);
