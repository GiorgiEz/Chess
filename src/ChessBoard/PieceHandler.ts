import {AlivePiece, ColorPiece, Moves, PieceType, Positions} from "../types";
import {addScore, adjustPiecePositions, getIndexAtPosition, isPieceOnSquare} from "../Canvas/utils";
import {Pawn} from "../Pieces/Pawn";
import {sounds} from "../exports";
import {Canvas} from "../Canvas/Canvas";
import {King} from "../Pieces/King";
import {getPossibleMovesForAllBlackPieces, getPossibleMovesForAllWhitePieces} from "../Pieces/AllMoves";
import {pieceMovementHandler} from "../Pieces/Movements";
import {Queen} from "../Pieces/Queen";
import {Rook} from "../Pieces/Rook";
import {Bishop} from "../Pieces/Bishop";
import {Knight} from "../Pieces/Knight";

export class PieceHandler {
    mousePosition: Positions
    redSquares: Positions[]
    board: AlivePiece[]
    pieces: PieceType[]
    pieceColors: ColorPiece[]
    draggingIndex: number

    constructor(mousePosition: Positions, board: AlivePiece[], pieceColors: ColorPiece[],
                pieces: PieceType[], draggingIndex: number, redSquares: Positions[],) {
        this.mousePosition = mousePosition
        this.board = board
        this.pieceColors = pieceColors
        this.pieces = pieces
        this.draggingIndex = draggingIndex
        this.redSquares = redSquares
    }

    handleKingMovement ()  {
        const king = new King()
        if (this.pieceColors[this.draggingIndex].color === "white") {
            return king.kingMovementHandler(King.white_king.index, this.redSquares,
                this.board, this.pieceColors, getPossibleMovesForAllBlackPieces)
        }
        else return king.kingMovementHandler(King.black_king.index, this.redSquares,
            this.board, this.pieceColors, getPossibleMovesForAllWhitePieces)
    }

    handleQueenMovement() {
        return pieceMovementHandler(new Queen(), this.board, this.pieceColors, this.draggingIndex, this.redSquares)
    }

    handleRookMovement() {
        return pieceMovementHandler(new Rook(), this.board, this.pieceColors, this.draggingIndex, this.redSquares)
    }

    handleBishopMovement() {
        return pieceMovementHandler(new Bishop(), this.board, this.pieceColors, this.draggingIndex, this.redSquares)
    }

    handleKnightMovement() {
        return pieceMovementHandler(new Knight(), this.board, this.pieceColors, this.draggingIndex, this.redSquares)
    }

    handlePawnMovement () {
        return pieceMovementHandler(new Pawn(), this.board, this.pieceColors, this.draggingIndex, this.redSquares)
    }

    // check if the position where the piece is moved is in the valid board array
    checkIfValid (validMoves: Moves[]) {
        let {x, y} = adjustPiecePositions(this.mousePosition)
        for (let move of validMoves) {
            if (x === move.x && y === move.y) {
                this.killPieces({x: move.x, y: move.y}); return true
            }
        }
        return false
    }

    killPieces (killedPiecePos: Positions) {
        Pawn.enPassantMove(killedPiecePos, this.board, this.pieceColors, this.draggingIndex, this.pieces)
        let killedPieceIndex = getIndexAtPosition(killedPiecePos.x, killedPiecePos.y, this.board)
        if (isPieceOnSquare(killedPiecePos.x, killedPiecePos.y, this.board) && this.pieceColors[killedPieceIndex] &&
            this.pieceColors[killedPieceIndex].color !== this.pieceColors[this.draggingIndex].color) {
            sounds.capture_sound.play()

            this.board[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
            if (this.pieceColors[killedPieceIndex].color === "white") {
                Canvas.blackScore += addScore(killedPieceIndex, this.pieceColors)
                Canvas.whiteKilledPieces.push(this.pieces[killedPieceIndex])
            }
            else {
                Canvas.whiteScore += addScore(killedPieceIndex, this.pieceColors)
                Canvas.blackKilledPieces.push(this.pieces[killedPieceIndex])
            }
        }
        return killedPieceIndex
    }
}
