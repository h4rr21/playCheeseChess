const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();

var port = 5000;
var server = http.createServer(app);
var io = socketIO(server);

var jugadas = []

io.on('connection',(socket)=>{
    console.log('usuario conectado');
});

server.listen(port, ()=>{
    console.log('Server listenning on port: '+port)
})