import {Positions} from "../Utils/types";
import {
    adjustPiecePositions, areOnlyKingsAlive, comparePositions, getPieceAtPosition, isPieceOnSquare} from "../Utils/utilFunctions";
import {Pawn} from "../Pieces/Pawn";
import {Pieces, sounds} from "../Utils/exports";
import {King} from "../Pieces/King";
import {Queen} from "../Pieces/Queen";
import {Rook} from "../Pieces/Rook";
import {Bishop} from "../Pieces/Bishop";
import {Knight} from "../Pieces/Knight";
import {FilterAllPotentialMoves, filterMovesByCheckingKingSafety} from "../Pieces/ValidMoves";
import Game from "./Game";

export class PieceHandler {
    private game: Game;

    constructor() {
        this.game = Game.getInstance();
    }

    handleKingMovement() {
        const king = new King()
        return filterMovesByCheckingKingSafety(this.game.draggingPiece!, king.validMoves.bind(king))
    }

    handleQueenMovement() {
        const queen = new Queen()
        return filterMovesByCheckingKingSafety(this.game.draggingPiece!, queen.validMoves.bind(queen))
    }

    handleRookMovement() {
        const rook = new Rook()
        return filterMovesByCheckingKingSafety(this.game.draggingPiece!, rook.validMoves.bind(rook))
    }

    handleBishopMovement() {
        const bishop = new Bishop()
        return filterMovesByCheckingKingSafety(this.game.draggingPiece!, bishop.validMoves.bind(bishop))
    }

    handleKnightMovement() {
        const knight = new Knight()
        return filterMovesByCheckingKingSafety(this.game.draggingPiece!, knight.validMoves.bind(knight))
    }

    handlePawnMovement() {
        const pawn = new Pawn()
        return filterMovesByCheckingKingSafety(this.game.draggingPiece!, pawn.validMoves.bind(pawn))
    }

    // check if the position where the piece is moved is in the valid moves array
    isValid(validMoves: Positions[]) {
        let {x, y} = adjustPiecePositions(this.game.mousePosition)
        for (let move of validMoves) {
            if (x === move.x && y === move.y) {
                this.killPiece({x: move.x, y: move.y});
                return true
            }
        }
        return false
    }

    isEnPassant(pos: Positions){
        if (this.game.draggingPiece && this.game.draggingPiece!.name === Pieces.PAWN && this.game.potentialEnPassantPawn
            && pos.x - this.game.potentialEnPassantPawn.x === 0)
        {
            if (this.game.draggingPiece!.color === "white") {
                if (this.game.potentialEnPassantPawn.y - pos.y === this.game.squareSize) {
                    return true
                }
            } else {
                if (pos.y - this.game.potentialEnPassantPawn.y === this.game.squareSize) {
                    return true
                }
            }
        }
        return false
    }

    killPiece(pos: Positions) {
        let killedPiece = getPieceAtPosition(pos.x, pos.y)

        if (killedPiece && isPieceOnSquare(pos.x, pos.y, this.game.chessboard)) {
            this.game.chessboard[killedPiece.index] = {...killedPiece, x: -1000, y: -1000}
            sounds.capture_sound.play()
        }
        if (this.isEnPassant(pos) && this.game.potentialEnPassantPawn){
            this.game.chessboard[this.game.potentialEnPassantPawn.index] = {...this.game.potentialEnPassantPawn, x: -1000, y: -1000}
            sounds.capture_sound.play()
        }
    }

    highlightSquares() {
        if ((this.game.turns % 2 === 1 && this.game.draggingPiece!.color === "black") ||
            (this.game.turns % 2 === 0 && this.game.draggingPiece!.color === "white") || !this.game.draggingPiece) {
            return;
        }
        let highlightedSquares: Positions[] = []

        switch (this.game.draggingPiece.name){
            case Pieces.PAWN:
                highlightedSquares = this.handlePawnMovement()
                break
            case Pieces.ROOK:
                highlightedSquares = this.handleRookMovement()
                break
            case Pieces.KNIGHT:
                highlightedSquares = this.handleKnightMovement()
                break
            case Pieces.BISHOP:
                highlightedSquares = this.handleBishopMovement()
                break
            case Pieces.KING:
                highlightedSquares = this.handleKingMovement()
                break
            case Pieces.QUEEN:
                highlightedSquares = this.handleQueenMovement()
                break
            default: break;
        }
        return highlightedSquares
    }

    isCheckmateOrStalemate(){
        const {whiteValidMoves, blackValidMoves} = FilterAllPotentialMoves()

        const whiteKingUnderAttack = blackValidMoves.filter(move => comparePositions(move, King.getWhiteKing(this.game.chessboard)))
        const blackKingUnderAttack = whiteValidMoves.filter(move => comparePositions(move, King.getBlackKing(this.game.chessboard)))

        if (!whiteValidMoves.length && whiteKingUnderAttack.length && this.game.turns % 2 === 1 && !this.game.blackWon) {
            sounds.checkmate_sound.play()
            this.game.blackWon = true
        }
        if (!blackValidMoves.length && blackKingUnderAttack.length && this.game.turns % 2 === 0 && !this.game.whiteWon) {
            sounds.checkmate_sound.play()
            this.game.whiteWon = true
        }
        if (!whiteValidMoves.length && !whiteKingUnderAttack.length && this.game.turns % 2 === 1 && !this.game.staleMate) {
            sounds.stalemate_sound.play()
            this.game.staleMate = true
        }
        if (!blackValidMoves.length && !blackKingUnderAttack.length && this.game.turns % 2 === 0 && !this.game.staleMate) {
            sounds.stalemate_sound.play()
            this.game.staleMate = true
        }
        if (areOnlyKingsAlive() && !this.game.staleMate) {
            sounds.stalemate_sound.play()
            this.game.staleMate = true
        }
    }

    movePieces() {
        if ((this.game.turns % 2 === 1 && this.game.draggingPiece?.color === "black") ||
            (this.game.turns % 2 === 0 && this.game.draggingPiece?.color === "white") ||
            (this.game.draggingPiece === null || this.game.draggingPiece.x < 0)) {
            return;
        }
        const { x, y } = adjustPiecePositions(this.game.mousePosition);

        switch (this.game.draggingPiece.name) {
            case Pieces.PAWN:
                if (!this.isValid(this.handlePawnMovement())) {
                    return;
                }
                this.candidatePawnForEnPassant(y);
                break;

            case Pieces.ROOK:
                if (!this.isValid(this.handleRookMovement())) {
                    return;
                }
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
                break;
            default: break;
        }
        sounds.move_sound.play();
        this.game.turns++;
        this.game.chessboard[this.game.draggingPiece.index] = {...this.game.draggingPiece, x, y}
        this.game.pieceMoved = true;
    }

    candidatePawnForEnPassant(y: number){
        if (this.game.draggingPiece && this.game.draggingPiece.color === "white"){
            if (this.game.draggingPiece.y - y === 2*this.game.squareSize) {
                this.game.potentialEnPassantPawn = {...this.game.draggingPiece}
            }
            else {
                this.game.potentialEnPassantPawn = null
            }
        }
        else if (this.game.draggingPiece){
            if (y - this.game.draggingPiece.y === 2*this.game.squareSize) {
                this.game.potentialEnPassantPawn = {...this.game.draggingPiece}
            }
            else {
                this.game.potentialEnPassantPawn = null
            }
        }
    }
}
