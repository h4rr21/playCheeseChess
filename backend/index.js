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

// -----------------------FRONT---------------------
// Translate to Regular Notation
// { piece: { notation: 'p@e7', name: 'p', index: 18, position: 'e7' },
//   source: 'e7',
//   dest: 'e6' }

// -----------------------BACK----------------------
// Nc6:
// { src: Square { file: 'b', piece: [Knight], rank: 8 },
//   dest: Square { file: 'c', piece: null, rank: 6 } },

translate = (move,possibleMoves)=>{
    const {piece,dest,source} = move;
    var  newMove = '';
    console.log(move, possibleMoves);

    Object.keys(possibleMoves).map((key, index) => {
        var sourceB = possibleMoves[key].src['file']+possibleMoves[key].src['rank'];
        //console.log("source: ",sourceB)
        var destB = possibleMoves[key].dest['file']+possibleMoves[key].dest['rank'];
        //console.log("dest: ",destB)
        if (sourceB === source && destB === dest){
            console.log(key);
            newMove = key;
        }
        return { ...sourceB,destB};
      });

    if (newMove){
        return newMove
    }else{
        return null
    }
    
}

io.on('connection',(socket)=>{
    status = gameClient.getStatus();
    console.log("game created -> ",status);
    console.log("valid movements ->",Object.keys(status.notatedMoves))

    socket.on('move',(oldMove)=>{
        status = gameClient.getStatus();
        console.log("----- debug ------ ",status);
        possibleMoves = gameClient.getStatus().notatedMoves;
        newMove = translate(oldMove,possibleMoves)
        console.log("*******",newMove)

        if (newMove){
            // console.log("Special Case",newMove, oldMove.piece["name"])
            if (newMove === '0-0' && oldMove.piece["name"] === 'K'){
                socket.emit('specialMove',{
                    dest:"f1", 
                    notation:"R@h1",
                    name:"R",
                    source:"h1"
                })
            }else if (newMove === '0-0' && oldMove.piece["name"] === 'k'){
                socket.emit('specialMove',{
                    dest:"f8",
                    notation:"r@h8",
                    name:"r",
                    source:"h8"
                })
            }else if (newMove === '0-0-0' && oldMove.piece["name"] === 'K'){
                console.log("entrando a enroque blanco")
                socket.emit('specialMove',{
                    dest:"d1",
                    notation:"R@a1",
                    name:"R",
                    source:"a1"
                })
            }else if (newMove === '0-0-0' && oldMove.piece["name"] === 'k'){
                socket.emit('specialMove',{
                    dest:"d8",
                    notation:"r@a8",
                    name:"r",
                    source:"a8"
                })
            }
            socket.emit('validMove',oldMove)
            move = gameClient.move(newMove);
        }else{
            socket.emit('invalidMove',oldMove)
        }
        
        // move = gameClient.move(oneMove.move);
        // possibleMoves = Object.keys(gameClient.getStatus().notatedMoves);
        // console.log(possibleMoves);


        // if (status.notatedMoves[oneMove]){
        //     console.log("valid move found",oneMove)
        //     jugadas.push(oneMove);
        //     move = gameClient.move(oneMove);
        //     socket.emit('validMove',oneMove)
        // }else{
        //     console.log("invalid move found: ",oneMove)
        //     socket.emit('invalidMove',oneMove)
        // }
        
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