import {AlivePiece, ColorPiece, Moves, PieceType, Positions} from "../types";
import {adjustPiecePositions, areOnlyKingsAlive, getIndexAtPosition, isPieceOnSquare} from "../Canvas/utils";
import {Pawn} from "../Pieces/Pawn";
import {Pieces, sounds, squareSize} from "../exports";
import {King} from "../Pieces/King";
import {Queen} from "../Pieces/Queen";
import {Rook} from "../Pieces/Rook";
import {Bishop} from "../Pieces/Bishop";
import {Knight} from "../Pieces/Knight";
import {Score} from "./Score";
import {pieceMovementHandler} from "../Pieces/moves/Movements";
import {allPossibleMoves, getPossibleMovesForAllBlackPieces, getPossibleMovesForAllWhitePieces} from "../Pieces/moves/AllMoves";
import {Team} from "./Team";

export class PieceHandler {
    static pieceMoved = false
    constructor(
        private mousePosition: Positions,
        private board: AlivePiece[],
        private pieceColors: ColorPiece[],
        private pieces: PieceType[],
        private draggingIndex: number,
        private redSquares: Positions[],
    ) {}

    handleKingMovement() {
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

    handlePawnMovement() {
        return pieceMovementHandler(new Pawn(), this.board, this.pieceColors, this.draggingIndex, this.redSquares)
    }

    // check if the position where the piece is moved is in the valid moves array
    isValid(validMoves: Moves[]) {
        let {x, y} = adjustPiecePositions(this.mousePosition)
        for (let move of validMoves) {
            if (x === move.x && y === move.y) {
                this.killPiece({x: move.x, y: move.y}); return true
            }
        }
        return false
    }

    killPiece(killedPiecePos: Positions) {
        const pawn = new Pawn()
        pawn.enPassantMove(killedPiecePos, this.board, this.pieceColors, this.draggingIndex, this.pieces)
        let killedPieceIndex = getIndexAtPosition(killedPiecePos.x, killedPiecePos.y, this.board)
        if (isPieceOnSquare(killedPiecePos.x, killedPiecePos.y, this.board) && this.pieceColors[killedPieceIndex] &&
            this.pieceColors[killedPieceIndex].color !== this.pieceColors[this.draggingIndex].color) {
            sounds.capture_sound.play()

            this.board[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
            let score = new Score(killedPieceIndex, this.pieceColors, this.pieces)
            score.addScore()
        }
        return killedPieceIndex
    }

    highlightSquares() {
        let highlightedSquares: Positions[] = []
        if (Team.turns % 2 === 1 && this.pieceColors[this.draggingIndex].color === "black") return;
        if (Team.turns % 2 === 0 && this.pieceColors[this.draggingIndex].color === "white") return

        if (this.pieceColors[this.draggingIndex].name === Pieces.PAWN) highlightedSquares = this.handlePawnMovement()
        if (this.pieceColors[this.draggingIndex].name === Pieces.ROOK) highlightedSquares = this.handleRookMovement()
        if (this.pieceColors[this.draggingIndex].name === Pieces.KNIGHT) highlightedSquares = this.handleKnightMovement()
        if (this.pieceColors[this.draggingIndex].name === Pieces.BISHOP) highlightedSquares = this.handleBishopMovement()
        if (this.pieceColors[this.draggingIndex].name === Pieces.KING) highlightedSquares = this.handleKingMovement()
        if (this.pieceColors[this.draggingIndex].name === Pieces.QUEEN) highlightedSquares = this.handleQueenMovement()
        return highlightedSquares
    }

    isCheckmateOrStalemate(){
        const whiteMoves = allPossibleMoves(this.board, this.pieceColors, []).whiteValidMoves
        const blackMoves = allPossibleMoves(this.board, this.pieceColors, []).blackValidMoves

        const whiteKingUnderAttack = blackMoves.filter(move => move.index === King.white_king.index)
        const blackKingUnderAttack = whiteMoves.filter(move => move.index === King.black_king.index)

        if (!whiteMoves.length && whiteKingUnderAttack.length && Team.turns % 2 === 1 && !Team.blackWon) {
            sounds.checkmate_sound.play()
            Team.blackWon = true
        }
        if (!blackMoves.length && blackKingUnderAttack.length && Team.turns % 2 === 0 && !Team.whiteWon) {
            sounds.checkmate_sound.play()
            Team.whiteWon = true
        }
        if (!whiteMoves.length && !whiteKingUnderAttack.length && Team.turns % 2 === 1 && !Team.staleMate) {
            sounds.stalemate_sound.play()
            Team.staleMate = true
        }
        if (!blackMoves.length && !blackKingUnderAttack.length && Team.turns % 2 === 0 && !Team.staleMate) {
            sounds.stalemate_sound.play()
            Team.staleMate = true
        }
        if (areOnlyKingsAlive(this.board, this.pieceColors) && !Team.staleMate) {
            sounds.stalemate_sound.play()
            Team.staleMate = true
        }
    }

    movePieces() {
        if (this.draggingIndex !== -1 && this.pieces[this.draggingIndex].isAlive) {
            let {x, y} = adjustPiecePositions(this.mousePosition)

            if (Team.turns % 2 === 1 && this.pieceColors[this.draggingIndex].color === "black") return;
            if (Team.turns % 2 === 0 && this.pieceColors[this.draggingIndex].color === "white") return;

            if (this.pieceColors[this.draggingIndex].name === Pieces.PAWN && !this.isValid(this.handlePawnMovement())) return
            else if (this.pieceColors[this.draggingIndex].name === Pieces.PAWN) {
                this.setLastMovedPawnIndex(y)
            }
            else Pawn.lastMovedPawnIndex = -1

            if (this.pieceColors[this.draggingIndex].name === Pieces.ROOK && !this.isValid(this.handleRookMovement())) return;
            else if (this.pieceColors[this.draggingIndex].name === Pieces.ROOK) Rook.hasMoved(this.pieceColors, this.draggingIndex)

            if (this.pieceColors[this.draggingIndex].name === Pieces.KNIGHT && !this.isValid(this.handleKnightMovement())) return;

            if (this.pieceColors[this.draggingIndex].name === Pieces.BISHOP && !this.isValid(this.handleBishopMovement())) return;

            if (this.pieceColors[this.draggingIndex].name === Pieces.QUEEN && !this.isValid(this.handleQueenMovement())) return;

            if (this.pieceColors[this.draggingIndex].name === Pieces.KING && !this.isValid(this.handleKingMovement())) return;
            else if (this.pieceColors[this.draggingIndex].name === Pieces.KING)
                Rook.castleRook(this.board, this.pieceColors, this.draggingIndex, x)

            sounds.move_sound.play()
            Team.turns ++
            this.board[this.draggingIndex] = {x: x, y: y, isAlive: true}
            PieceHandler.pieceMoved = true
        }
    }

    setLastMovedPawnIndex(y: number){
        if (this.pieceColors[this.draggingIndex].color === "white"){
            if (this.board[this.draggingIndex].y - y === 2*squareSize) Pawn.lastMovedPawnIndex = this.draggingIndex
            else Pawn.lastMovedPawnIndex = -1
        }
        else {
            if (y - this.board[this.draggingIndex].y === 2*squareSize) Pawn.lastMovedPawnIndex = this.draggingIndex
            else Pawn.lastMovedPawnIndex = -1
        }
    }
}
