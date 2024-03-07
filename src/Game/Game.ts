import {PieceType, Positions} from "../Utils/types";
import {pieceImages, Pieces} from "../Utils/exports";
import {createImage, getPieceAtPosition, isPieceOnSquare} from "../Utils/utilFunctions";

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
    public highlightedMoves: Positions[] = []

    public mousePosition = {x: 0, y: 0}

    private constructor() {
        const minDimension = (Math.min(window.innerWidth, window.innerHeight) / 1.6)
        this.canvasSize = minDimension > 700 ? 900 : minDimension > 400 ? 600 : 300
        this.squareSize = this.canvasSize / 8;
        this.imageSize = (this.squareSize * 2) / 3;
        this.shiftImage = (this.squareSize - this.imageSize) / 2;
        this.chessboard = this.setupChessBoard()
    }

    public static getInstance(): Game {
        if (!Game.instance) {
            Game.instance = new Game();
        }
        return Game.instance;
    }

    getValidMovesForKnightOrKing(piece: PieceType, moves: Positions[], chessboard: PieceType[]) {
        let validMoves = []
        for (let move of moves){
            if (move.x >= 0 && move.x <= this.canvasSize && move.y >= 0 && move.y <= this.canvasSize) {
                const sameColors = getPieceAtPosition(move.x, move.y, chessboard)?.color === piece.color
                if (!isPieceOnSquare(move.x, move.y, chessboard) || (isPieceOnSquare(move.x, move.y, chessboard) && !sameColors)) {
                    validMoves.push(move)
                }
            }
        }
        return validMoves
    }

    getValidMovesForRookOrBishop(dx: number, dy: number, piece: PieceType, chessboard: PieceType[]) {
        let validMoves: Positions[] = [];
        for (let square = this.squareSize; square < this.canvasSize; square += this.squareSize) {
            const x = piece?.x + square * dx;
            const y = piece?.y + square * dy;
            const pieceOnTheWay = getPieceAtPosition(x, y, chessboard);

            if (x >= 0 && x <= this.canvasSize && y >= 0 && y <= this.canvasSize) {
                const sameColors = pieceOnTheWay?.color === piece?.color;
                if (isPieceOnSquare(x, y, chessboard) && sameColors) {
                    break;
                }
                else if (isPieceOnSquare(x, y, chessboard) && !sameColors) {
                    validMoves.push({x, y});
                    break;
                }
                validMoves.push({x, y});
            }
        }
        return validMoves;
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
        const namesArray = [Pieces.ROOK, Pieces.KNIGHT, Pieces.BISHOP, Pieces.QUEEN,
            Pieces.KING, Pieces.BISHOP, Pieces.KNIGHT, Pieces.ROOK]

        let index = 0
        for (let pos = this.shiftImage, i = 0; i < blackPieces.length; pos += this.squareSize, i++) {
            chessboard.push({image: createImage(blackPieces[i]), x: pos,
                y: this.shiftImage, color: "black", name: namesArray[i], index: i + index++})

            chessboard.push({image: createImage(pieceImages.black_pawn), x: pos,
                y: this.squareSize+this.shiftImage, color: "black", name: Pieces.PAWN, index: i + index++})

            chessboard.push({image: createImage(pieceImages.white_pawn), x: pos,
                y: this.canvasSize - 2*this.squareSize + this.shiftImage, color: "white", name: Pieces.PAWN, index: i + index++})

            chessboard.push({image: createImage(whitePieces[i]), x: pos,
                y: this.canvasSize - this.squareSize + this.shiftImage, color: "white", name: namesArray[i], index: i + index})
        }
        return chessboard
    }
}

export default Game;
