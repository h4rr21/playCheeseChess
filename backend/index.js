const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const chess = require('chess');
 
const app = express();

var port = 5000;
var server = http.createServer(app);
var io = socketIO(server);

var frontBoardState = [];
var gameClient = chess.create();

// -----------------------FRONT---------------------
// Translate to Regular Notation
// { piece: { notation: 'p@e7', name: 'p', index: 18, position: 'e7' },
//   source: 'e7',
//   dest: 'e6' }

// -----------------------BACK----------------------
// Nc6:
// { src: Square { file: 'b', piece: [Knight], rank: 8 },
//   dest: Square { file: 'c', piece: null, rank: 6 } },

// { move:
//     { algebraic: 'f6',
//       capturedPiece:
//        Pawn { moveCount: 1, notation: '', side: [Object], type: 'pawn' },
//       castle: false,
//       enPassant: true,
//       postSquare: Square { file: 'f', piece: [Pawn], rank: 6 },
//       prevSquare: Square { file: 'e', piece: null, rank: 5 } 
//     },
//    undo: [Function] 
// }


// translate FRON notation to BACK notation
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
    // console.log("game created -> ",status);
    // console.log("valid movements ->",Object.keys(status.notatedMoves))

    socket.on('move',(oldMove)=>{
        // save FRONT board state
        frontBoardState = oldMove.boardState;
        status = gameClient.getStatus();
        // console.log("----- debug ------ ",status);
        possibleMoves = gameClient.getStatus().notatedMoves;
        newMove = translate(oldMove,possibleMoves)
        // console.log("******* debug ****",newMove)

        if (newMove){
            // console.log("Special Case",newMove, oldMove.piece["name"])
            if (newMove === '0-0' && oldMove.piece["name"] === 'K'){
                io.emit('castle',{
                    dest:"f1", 
                    notation:"R@h1",
                    name:"R",
                    source:"h1"
                })
            }else if (newMove === '0-0' && oldMove.piece["name"] === 'k'){
                io.emit('castle',{
                    dest:"f8",
                    notation:"r@h8",
                    name:"r",
                    source:"h8"
                })
            }else if (newMove === '0-0-0' && oldMove.piece["name"] === 'K'){
                console.log("entrando a enroque blanco")
                io.emit('castle',{
                    dest:"d1",
                    notation:"R@a1",
                    name:"R",
                    source:"a1"
                })
            }else if (newMove === '0-0-0' && oldMove.piece["name"] === 'k'){
                io.emit('castle',{
                    dest:"d8",
                    notation:"r@a8",
                    name:"r",
                    source:"a8"
                })
            }
            // io.emit('validMove',oldMove)
            move = gameClient.move(newMove);
            // console.log(move.move)
            if (move.move.enPassant === true){
                pawnToRemove = move.move.postSquare["file"]+move.move.prevSquare["rank"];
                // console.log("peon a remover",pawnToRemove)
                // console.log("debug Peon al paso: ",move.move.capturedPiece)
                if (move.move.capturedPiece["side"].name === 'white'){
                    var notation ='P@'+pawnToRemove
                    var name = "P"
                }else{
                    var notation='p@'+pawnToRemove
                    var name = "p"
                }
                io.emit('enPassant',{
                    dest:pawnToRemove,
                    notation:notation,
                    name:name,
                    source:move.source
                })
            }
            
        }else{
            io.emit('invalidMove',oldMove)
        }
        
    });

    socket.on('resetGame',()=>{
        gameClient = chess.create();
    });
});

server.listen(port, ()=>{
    console.log('Server listenning on port: '+port)
}) 
