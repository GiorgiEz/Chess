import {PieceType, Positions} from "../Utils/types";
import {pieceImages} from "../Utils/exports";
import {createImage} from "../Utils/utilFunctions";

class Game {
    private static instance: Game | null = null;

    public canvasSize: number
    public squareSize: number
    public imageSize: number
    public shiftImage: number

    public whiteWon = false
    public blackWon = false
    public staleMate = false
    public turns = 1

    public isMenuScreenOn = true
    public isSoundOn = true
    public isPromotionScreenOn = false

    public pieceMoved = false

    public promotedPawn: PieceType | null = null
    public potentialEnPassantPawn: PieceType | null = null
    public draggingPiece: PieceType | null = null

    public chessboard: PieceType[] = []
    public threatenedSquares: Positions[] = []

    private constructor() {
        // this.canvasSize = window.innerWidth > 1000 ? window.innerWidth / 2.4 : window.innerWidth / 1.2;
        this.canvasSize = 600
        this.squareSize = this.canvasSize / 8;
        this.imageSize = (this.squareSize * 2) / 3;
        this.shiftImage = (this.squareSize - this.imageSize) / 2;
        this.chessboard = this.setupChessBoard()
        console.log("Game class instance has been created")
    }

    public static getInstance(): Game {
        if (!Game.instance) {
            Game.instance = new Game();
        }
        return Game.instance;
    }

    setupChessBoard(){
        const chessboard: PieceType[] = []

        const blackPieces = [
            pieceImages.black_rook, pieceImages.black_knight, pieceImages.black_bishop, pieceImages.black_queen,
            pieceImages.black_king, pieceImages.black_bishop, pieceImages.black_knight, pieceImages.black_rook
        ]
        const whitePieces = [
            pieceImages.white_rook, pieceImages.white_knight, pieceImages.white_bishop, pieceImages.white_queen,
            pieceImages.white_king, pieceImages.white_bishop, pieceImages.white_knight, pieceImages.white_rook
        ]
        const namesArray = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

        let index = 0
        for (let pos = this.shiftImage, i = 0; i < blackPieces.length; pos += this.squareSize, i++) {
            chessboard.push({image: createImage(blackPieces[i]), x: pos,
                y: this.shiftImage, color: "black", name: namesArray[i], index: i + index++})

            chessboard.push({image: createImage(pieceImages.black_pawn), x: pos,
                y: this.squareSize+this.shiftImage, color: "black", name:"pawn", index: i + index++})

            chessboard.push({image: createImage(pieceImages.white_pawn), x: pos,
                y: this.canvasSize - 2*this.squareSize + this.shiftImage, color: "white", name:"pawn", index: i + index++})

            chessboard.push({image: createImage(whitePieces[i]), x: pos,
                y: this.canvasSize - this.squareSize + this.shiftImage, color: "white", name: namesArray[i], index: i + index})
        }
        return chessboard
    }
}

export default Game;
