const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const chess = require('chess');
 
const app = express();

var port = 5000;
var server = http.createServer(app);
var io = socketIO(server);

var jugadas = [];
const gameClient = chess.create();

// Test
// const gameClient = chess.create();
// status = gameClient.getStatus();
// console.log("game created -> ",status);
// console.log("valid movements ->",status.notatedMoves)

// var moveToValidate = 'a5'
// if (status.notatedMoves[moveToValidate]){
//     console.log("valid move found")
// }else{
//     console.log("invalid move found")
// }


io.on('connection',(socket)=>{
    status = gameClient.getStatus();
    console.log("game created -> ",status);
    console.log("valid movements ->",status.notatedMoves)

    socket.on('move',(oneMove)=>{
        status = gameClient.getStatus();
        if (status.notatedMoves[oneMove]){
            console.log("valid move found",oneMove)
            jugadas.push(oneMove);
            move = gameClient.move(oneMove);
            socket.emit('validMove',oneMove)
        }else{
            console.log("invalid move found: ",oneMove)
            socket.emit('invalidMove',oneMove)
        }
        
    });

    // capture check and checkmate events
    socket.on('check', (attack) => {
    // get more details about the attack on the King
    console.log(attack);
    });

    socket.on('resetGame',()=>{
        gameClient = chess.create();
        jugadas
    });
});

server.listen(port, ()=>{
    console.log('Server listenning on port: '+port)
}) 