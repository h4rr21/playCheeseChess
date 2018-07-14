const React = require('react')
const Chess = require('react-chess')
const socketIo = require('socket.io-client')

require('./App.css')

class App extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      pieces: Chess.getDefaultLineup(), 
      allowMoves: true
    }
    this.handleMovePiece = this.handleMovePiece.bind(this)
    this.socket = socketIo('http://localhost:5000')
  }
  
  updateBoard = (pieceName, pieceIndex, pieceDest)=>{
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
    console.log(piece, this.state.pieces)
    var saveState = this.state.pieces;

    this.socket.emit("move",{piece: piece, source:fromSquare, dest:toSquare});

    this.updateBoard(piece.name, piece.index, toSquare);

    this.socket.on('specialMove',(spMove)=>{
        var spIndex = this.state.pieces.indexOf(spMove.notation)
        this.updateBoard(spMove.name, spIndex, spMove.dest);
        console.log('specialMove',spMove,spIndex)
    })

    this.socket.on('validMove',(resp)=>{
      console.log('valid move',resp)
    })

    this.socket.on('invalidMove',(resp)=>{
      // return to old state if invalid move
      this.setState({pieces: saveState})
      console.log('invalidMove',resp);
    })
    
    console.log(this.state.pieces)
  }

  render() {
    const {pieces} = this.state
    return (
      <div className="App">
        <Chess pieces={pieces} allowMoves={this.state.allowMoves} onMovePiece={this.handleMovePiece} />
      </div>
    )
  }
}

module.exports = App