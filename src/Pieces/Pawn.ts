import {PieceType, Positions} from "../Utils/types";
import {comparePositions, getPieceAtPosition, isPieceOnSquare,} from "../Utils/utilFunctions"
import Game from "../ChessBoard/Game";

export class Pawn {
    private readonly game: Game;

    constructor() {
        this.game = Game.getInstance();
    }

    validMoves(piece: PieceType, chessboard: PieceType[]): Positions[] {
        const {x, y} = piece
        const isWhite = piece.color === "white"
        const validMoves = []

        const topLeft: Positions = isWhite ?
            {x: x - this.game.squareSize, y: y - this.game.squareSize} :
            {x: x - this.game.squareSize, y: y + this.game.squareSize}

        const topRight = isWhite ?
            {x: x + this.game.squareSize, y: y - this.game.squareSize } :
            {x: x + this.game.squareSize, y: y + this.game.squareSize }

        const inFront = isWhite ?
            {x: x, y: y - this.game.squareSize } :
            {x: x, y: y + this.game.squareSize }

        const twoSquaresInFront = isWhite ?
            {x: x, y: y - this.game.squareSize*2 } :
            {x: x, y: y + this.game.squareSize*2 }

        //Check for En Passant moves
        if (this.game.potentialEnPassantPawn !== null){
            const pieceOnSide = getPieceAtPosition(x-this.game.squareSize, y, chessboard)
            if ((this.game.draggingPiece?.color === "white" && this.game.potentialEnPassantPawn.color === "black") ||
                (this.game.draggingPiece?.color === "black" && this.game.potentialEnPassantPawn.color === "white")) {
                if (pieceOnSide && comparePositions(pieceOnSide, this.game.potentialEnPassantPawn)) {
                    validMoves.push(topLeft)
                }
            }
        }

        if (this.game.potentialEnPassantPawn !== null){
            const pieceOnSide = getPieceAtPosition(x+this.game.squareSize, y, chessboard)
            if ((this.game.draggingPiece?.color === "white" && this.game.potentialEnPassantPawn.color === "black") ||
                (this.game.draggingPiece?.color === "black" && this.game.potentialEnPassantPawn.color === "white")) {
                if (pieceOnSide && comparePositions(pieceOnSide, this.game.potentialEnPassantPawn)) {
                    validMoves.push(topRight)
                }
            }
        }

        if (x >= 0 && x <= this.game.canvasSize && y >= 0 && y <= this.game.canvasSize) {
            const pieceOnTopLeft = getPieceAtPosition(topLeft.x, topLeft.y, chessboard)
            if (pieceOnTopLeft && pieceOnTopLeft.color !== piece.color) {
                validMoves.push(topLeft)
            }

            const pieceOnTopRight = getPieceAtPosition(topRight.x, topRight.y, chessboard)
            if (pieceOnTopRight && pieceOnTopRight.color !== piece.color) {
                validMoves.push(topRight)
            }

            if (inFront && getPieceAtPosition(inFront.x, inFront.y, chessboard) === null) {
                validMoves.push(inFront)
            }

            // Check if pawn hasn't moved
            if (isWhite && y === this.game.canvasSize - 2 * this.game.squareSize + this.game.shiftImage){
                if(!isPieceOnSquare(inFront.x, inFront.y, chessboard) &&
                    !isPieceOnSquare(twoSquaresInFront.x, twoSquaresInFront.y, chessboard)){
                    validMoves.push(twoSquaresInFront)
                }
            } else if (!isWhite && y === this.game.shiftImage + this.game.squareSize
                && !isPieceOnSquare(inFront!.x, inFront!.y, chessboard)
                && !isPieceOnSquare(twoSquaresInFront.x, twoSquaresInFront.y, chessboard)) {
                validMoves.push(twoSquaresInFront)
            }
        }
        return validMoves
    }
}
