import {Moves, PieceType, Positions} from "../types";
import {adjustPiecePositions, areOnlyKingsAlive, getIndexAtPosition, isPieceOnSquare} from "../utils";
import {Pawn} from "../Pieces/Pawn";
import {Pieces, sounds, squareSize} from "../exports";
import {King} from "../Pieces/King";
import {Queen} from "../Pieces/Queen";
import {Rook} from "../Pieces/Rook";
import {Bishop} from "../Pieces/Bishop";
import {Knight} from "../Pieces/Knight";
import {pieceMovementHandler} from "../Pieces/moves/Movements";
import {allPossibleMoves, getPossibleMovesForAllBlackPieces, getPossibleMovesForAllWhitePieces} from "../Pieces/moves/AllMoves";
import {Team} from "./Team";

export class PieceHandler {
    static pieceMoved = false
    private isWhitesTurn = Team.turns % 2 === 1

    constructor(
        private mousePosition: Positions,
        private board: PieceType[],
        private draggingIndex: number,
        private redSquares: Positions[],
    ) {}

    handleKingMovement() {
        const king = new King()

        if (this.board[this.draggingIndex].color === "white") {
            return king.kingMovementHandler(King.white_king.index, this.redSquares,
                this.board, this.board, getPossibleMovesForAllBlackPieces)
        }
        else {
            return king.kingMovementHandler(King.black_king.index, this.redSquares,
                this.board, this.board, getPossibleMovesForAllWhitePieces)
        }
    }

    handleQueenMovement() {
        return pieceMovementHandler(new Queen(), this.board, this.draggingIndex, this.redSquares)
    }

    handleRookMovement() {
        return pieceMovementHandler(new Rook(), this.board, this.draggingIndex, this.redSquares)
    }

    handleBishopMovement() {
        return pieceMovementHandler(new Bishop(), this.board, this.draggingIndex, this.redSquares)
    }

    handleKnightMovement() {
        return pieceMovementHandler(new Knight(), this.board, this.draggingIndex, this.redSquares)
    }

    handlePawnMovement() {
        return pieceMovementHandler(new Pawn(), this.board, this.draggingIndex, this.redSquares)
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
        pawn.enPassantMove(killedPiecePos, this.board, this.draggingIndex)
        let killedPieceIndex = getIndexAtPosition(killedPiecePos.x, killedPiecePos.y, this.board)

        if (isPieceOnSquare(killedPiecePos.x, killedPiecePos.y, this.board) && this.board[killedPieceIndex] &&
            this.board[killedPieceIndex].color !== this.board[this.draggingIndex].color) {
            sounds.capture_sound.play()

            this.board[killedPieceIndex] = {...this.board[killedPieceIndex], x: -1000, y: -1000}
        }
        return killedPieceIndex
    }

    highlightSquares() {
        let highlightedSquares: Positions[] = []
        if ((this.isWhitesTurn && this.board[this.draggingIndex].color === "black") ||
            (!this.isWhitesTurn && this.board[this.draggingIndex].color === "white")) {
            return;
        }

        if (this.board[this.draggingIndex].name === Pieces.PAWN) {
            highlightedSquares = this.handlePawnMovement()
        }
        if (this.board[this.draggingIndex].name === Pieces.ROOK) {
            highlightedSquares = this.handleRookMovement()
        }
        if (this.board[this.draggingIndex].name === Pieces.KNIGHT) {
            highlightedSquares = this.handleKnightMovement()
        }
        if (this.board[this.draggingIndex].name === Pieces.BISHOP) {
            highlightedSquares = this.handleBishopMovement()
        }
        if (this.board[this.draggingIndex].name === Pieces.KING) {
            highlightedSquares = this.handleKingMovement()
        }
        if (this.board[this.draggingIndex].name === Pieces.QUEEN) {
            highlightedSquares = this.handleQueenMovement()
        }
        return highlightedSquares
    }

    isCheckmateOrStalemate(){
        const whiteMoves = allPossibleMoves(this.board, []).whiteValidMoves
        const blackMoves = allPossibleMoves(this.board,  []).blackValidMoves

        const whiteKingUnderAttack = blackMoves.filter(move => move.index === King.white_king.index)
        const blackKingUnderAttack = whiteMoves.filter(move => move.index === King.black_king.index)

        if (!whiteMoves.length && whiteKingUnderAttack.length && this.isWhitesTurn && !Team.blackWon) {
            sounds.checkmate_sound.play()
            Team.blackWon = true
        }
        if (!blackMoves.length && blackKingUnderAttack.length && !this.isWhitesTurn && !Team.whiteWon) {
            sounds.checkmate_sound.play()
            Team.whiteWon = true
        }
        if (!whiteMoves.length && !whiteKingUnderAttack.length && this.isWhitesTurn && !Team.staleMate) {
            sounds.stalemate_sound.play()
            Team.staleMate = true
        }
        if (!blackMoves.length && !blackKingUnderAttack.length && !this.isWhitesTurn && !Team.staleMate) {
            sounds.stalemate_sound.play()
            Team.staleMate = true
        }
        if (areOnlyKingsAlive(this.board) && !Team.staleMate) {
            sounds.stalemate_sound.play()
            Team.staleMate = true
        }
    }

    movePieces() {
        if (this.draggingIndex === -1 || this.board[this.draggingIndex].x < 0) {
            return;
        }

        const { x, y } = adjustPiecePositions(this.mousePosition);

        if (this.isWhitesTurn && this.board[this.draggingIndex].color === "black") {
            return;
        }
        if (!this.isWhitesTurn && this.board[this.draggingIndex].color === "white") {
            return;
        }

        const pieceName = this.board[this.draggingIndex].name;

        switch (pieceName) {
            case Pieces.PAWN:
                if (!this.isValid(this.handlePawnMovement())) {
                    return;
                }
                this.setLastMovedPawnIndex(y);
                break;

            case Pieces.ROOK:
                if (!this.isValid(this.handleRookMovement())) {
                    return;
                }
                Rook.hasMoved(this.board, this.draggingIndex);
                break;

            case Pieces.KNIGHT:
                if (!this.isValid(this.handleKnightMovement())) {
                    return;
                }
                break;

            case Pieces.BISHOP:
                if (!this.isValid(this.handleBishopMovement())) {
                    return;
                }
                break;

            case Pieces.QUEEN:
                if (!this.isValid(this.handleQueenMovement())) {
                    return;
                }
                break;

            case Pieces.KING:
                if (!this.isValid(this.handleKingMovement())) {
                    return;
                }
                Rook.castleRook(this.board, this.draggingIndex, x);
                break;

            default:
                break;
        }

        sounds.move_sound.play();
        Team.turns++;
        this.board[this.draggingIndex] = {...this.board[this.draggingIndex],  x: x, y: y };
        PieceHandler.pieceMoved = true;
    }

    setLastMovedPawnIndex(y: number){
        if (this.board[this.draggingIndex].color === "white"){
            if (this.board[this.draggingIndex].y - y === 2*squareSize) {
                Pawn.lastMovedPawnIndex = this.draggingIndex
            }
            else {
                Pawn.lastMovedPawnIndex = -1
            }
        }
        else {
            if (y - this.board[this.draggingIndex].y === 2*squareSize) {
                Pawn.lastMovedPawnIndex = this.draggingIndex
            }
            else {
                Pawn.lastMovedPawnIndex = -1
            }
        }
    }
}
