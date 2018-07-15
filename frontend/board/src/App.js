const React = require('react')
const Chess = require('react-chess')
const socketIo = require('socket.io-client')

require('./App.css')

class App extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      pieces: Chess.getDefaultLineup(), 
      allowMoves: true,
      oldState: {},
      endpoint: 'http://localhost:5000',
    }
    this.handleMovePiece = this.handleMovePiece.bind(this)
    this.resetapp = this.resetapp.bind(this)
  }
  
  updateBoard = (pieceName, pieceIndex, pieceDest)=>{
    console.log("updating board",pieceName, pieceIndex, pieceDest)
    const newPieces = this.state.pieces
      .map((curr, index) => {
        if (pieceIndex === index) {
          return `${pieceName}@${pieceDest}`
        } else if (curr.indexOf(pieceDest) === 2) {
          return false // To be removed from the board
        }
        return curr
      })
      .filter(Boolean)

      this.setState({pieces: newPieces})
  }

  handleMovePiece(piece, fromSquare, toSquare) {
    const socket = socketIo(this.state.endpoint)
    // console.log(piece, this.state.pieces)
    this.setState({oldState:this.state.pieces});

    socket.emit("move",{piece: piece, source:fromSquare, dest:toSquare, boardState:this.state.pieces});

    this.updateBoard(piece.name, piece.index, toSquare);

    // console.log(this.state.pieces)
  }

 resetapp(){
    const socket = socketIo(this.state.endpoint);
    socket.emit("resetGame",{});
    this.setState({pieces:Chess.getDefaultLineup()});
  }

  render() {
    const {pieces,endpoint} = this.state
    const socket = socketIo(endpoint)

    // socket.on("loadState",(currentState)=>{
    //   if (currentState){
    //     this.setState({pieces:Chess.getDefaultLineup()});
    //   }else{
    //     this.setState({pieces:Chess.getDefaultLineup()});
    //   }
      
    // })

    socket.on('castle',(spMove)=>{
      var spIndex = this.state.pieces.indexOf(spMove.notation)
      if (spIndex >= 0) {
        this.updateBoard(spMove.name, spIndex, spMove.dest);
        this.setState({oldState : this.state.pieces});
        console.log('castle',spMove,spIndex)
      }  
    })
  
    socket.on('enPassant',(spMove)=>{
      this.updateBoard(spMove.name, -1, spMove.dest);
      this.setState({oldState : this.state.pieces, });
       console.log('enPassant',spMove)
    })

    socket.on('invalidMove',(resp)=>{
      // return to old state if invalid move
      this.setState({pieces: this.state.oldState, allowMoves:true})
       console.log('invalidMove',resp);
    })


    return (
      <div className="App">
        <button onClick={this.resetapp}>Reset Game</button> 
        <Chess pieces={pieces} allowMoves={this.state.allowMoves} onMovePiece={this.handleMovePiece} />
      </div>
    )
  }
}

module.exports = App