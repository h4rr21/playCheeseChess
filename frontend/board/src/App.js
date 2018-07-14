const React = require('react')
const Chess = require('react-chess')
const socketIo = require('socket.io-client')

// require('./demo.css')

class App extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {pieces: Chess.getDefaultLineup()}
    this.handleMovePiece = this.handleMovePiece.bind(this)
    this.socket = socketIo('http://localhost:5000')
  }

  handleMovePiece(piece, fromSquare, toSquare) {
    console.log(this.state.pieces)
    var saveState = this.state.pieces;

    this.socket.emit("move",{piece: piece, source:fromSquare, dest:toSquare});

    const newPieces = this.state.pieces
      .map((curr, index) => {
        if (piece.index === index) {
          return `${piece.name}@${toSquare}`
        } else if (curr.indexOf(toSquare) === 2) {
          return false // To be removed from the board
        }
        return curr
      })
      .filter(Boolean)

      this.setState({pieces: newPieces})

    this.socket.on('validMove',(resp)=>{
      console.log('valid move')
    })

    this.socket.on('invalidMove',(resp)=>{
      this.setState({piece: saveState})
      console.log('invalidMove',resp);
    })
    
    console.log(this.state.pieces)
  }

  render() {
    const {pieces} = this.state
    return (
      <div className="App">
        <Chess pieces={pieces} onMovePiece={this.handleMovePiece} />
      </div>
    )
  }
}

module.exports = App