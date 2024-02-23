import {PieceType, Positions} from "../Utils/types";
import {
    adjustPiecePositions, areOnlyKingsAlive, comparePositions, getPieceAtPosition} from "../Utils/utilFunctions";
import {Pawn} from "../Pieces/Pawn";
import {Pieces, sounds} from "../Utils/exports";
import {King} from "../Pieces/King";
import {Queen} from "../Pieces/Queen";
import {Rook} from "../Pieces/Rook";
import {Bishop} from "../Pieces/Bishop";
import {Knight} from "../Pieces/Knight";
import {FilterAllPotentialMoves, filterMovesByCheckingKingSafety} from "../Pieces/ValidMoves";
import Game from "./Game";

export class GameManager {
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
                this.killPiece(move)
                return true
            }
        }
        return false
    }

    killPiece(pos: Positions) {
        let killedPiece = getPieceAtPosition(pos.x, pos.y)

        if (killedPiece || this.killEnPassantPawn(pos)) {
            const piece = killedPiece ? killedPiece : this.game.potentialEnPassantPawn!
            this.game.chessboard[piece.index] = {...piece, x: -1000, y: -1000}
            sounds.capture_sound.play()
        }
    }

    highlightSquares(): Positions[] {
        if ((this.game.turns % 2 === 1 && this.game.draggingPiece!.color === "black") ||
            (this.game.turns % 2 === 0 && this.game.draggingPiece!.color === "white") || !this.game.draggingPiece) {
            return [];
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
        const { x, y } = adjustPiecePositions(this.game.mousePosition)

        switch (this.game.draggingPiece.name) {
            case Pieces.PAWN:
                if (!this.isValid(this.handlePawnMovement())) {
                    return;
                }
                break;

            case Pieces.ROOK:
                if (!this.isValid(this.handleRookMovement())) {
                    return;
                }
                if (this.game.draggingPiece.index === Rook.getLeftWhiteRook(this.game.chessboard).index){
                    Rook.hasLeftWhiteRookMoved = true
                } else if (this.game.draggingPiece.index === Rook.getRightWhiteRook(this.game.chessboard).index){
                    Rook.hasRightWhiteRookMoved = true
                } else if (this.game.draggingPiece.index === Rook.getLeftBlackRook(this.game.chessboard).index){
                    Rook.hasLeftBlackRookMoved = true
                } else if (this.game.draggingPiece.index === Rook.getRightBlackRook(this.game.chessboard).index){
                    Rook.hasRightBlackRookMoved = true
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
                this.moveRookIfKingCastled(this.game.draggingPiece, x)
                if (this.game.draggingPiece.index === King.getWhiteKing(this.game.chessboard).index){
                    King.hasWhiteKingMoved = true
                } else {
                    King.hasBlackKingMoved = true
                }
                break;

            default:
                break;
        }

        sounds.move_sound.play();
        this.game.turns++;
        this.game.chessboard[this.game.draggingPiece.index] = {...this.game.draggingPiece, x, y}
        this.game.pieceMoved = true;
        this.game.potentialEnPassantPawn = this.isPotentialEnPassantPawn(y) ? this.game.draggingPiece : null
    }

    moveRookIfKingCastled(king: PieceType, x: number){
        if(king.color === "white"){
            if (x - king.x === this.game.squareSize * 2){
                const rook = Rook.getRightWhiteRook(this.game.chessboard)
                this.game.chessboard[rook.index] = {...rook, x: rook.x - 2 * this.game.squareSize}
            } else if (king.x - x === this.game.squareSize * 2){
                const rook = Rook.getLeftWhiteRook(this.game.chessboard)
                this.game.chessboard[rook.index] = {...rook, x: rook.x + 3 * this.game.squareSize}
            }
        } else {
            if (x - king.x === this.game.squareSize * 2){
                const rook = Rook.getRightBlackRook(this.game.chessboard)
                this.game.chessboard[rook.index] = {...rook, x: rook.x - 2 * this.game.squareSize}
            } else if (king.x - x === this.game.squareSize * 2){
                const rook = Rook.getLeftBlackRook(this.game.chessboard)
                this.game.chessboard[rook.index] = {...rook, x: rook.x + 3 * this.game.squareSize}
            }
        }
    }

    isPotentialEnPassantPawn(y: number){
        return this.game.draggingPiece!.name === Pieces.PAWN && Math.abs(this.game.draggingPiece!.y - y) === 2 * this.game.squareSize
    }

    killEnPassantPawn(pos: Positions){
        return this.game.draggingPiece!.name === Pieces.PAWN
            && Math.abs(pos.x - this.game.draggingPiece!.x) === this.game.squareSize
            && Math.abs(pos.y - this.game.draggingPiece!.y) === this.game.squareSize
    }
}
