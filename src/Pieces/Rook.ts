import {PieceType, Positions} from "../Utils/types";
import {Pieces} from "../Utils/exports";
import Game from "../Game/Game";

export class Rook{
    private game: Game;
    static hasLeftWhiteRookMoved = false
    static hasRightWhiteRookMoved = false
    static hasLeftBlackRookMoved = false
    static hasRightBlackRookMoved = false

    constructor() {
        this.game = Game.getInstance();
    }

    static getLeftWhiteRook(chessboard: PieceType[]){
        return chessboard.filter((piece: PieceType) => piece.color === "white" && piece.name === Pieces.ROOK)[0]
    }

    static getRightWhiteRook(chessboard: PieceType[]){
        return chessboard.filter((piece: PieceType) => piece.color === "white" && piece.name === Pieces.ROOK)[1]
    }

    static getLeftBlackRook(chessboard: PieceType[]){
        return chessboard.filter((piece: PieceType) => piece.color === "black" && piece.name === Pieces.ROOK)[0]
    }

    static getRightBlackRook(chessboard: PieceType[]){
        return chessboard.filter((piece: PieceType) => piece.color === "black" && piece.name === Pieces.ROOK)[1]
    }

    validMoves(piece: PieceType, chessboard: PieceType[]): Positions[] {
        return this.game.getValidMovesForRookOrBishop(-1, 0, piece, chessboard)
            .concat(this.game.getValidMovesForRookOrBishop(1, 0, piece, chessboard))
            .concat(this.game.getValidMovesForRookOrBishop(0, -1, piece, chessboard))
            .concat(this.game.getValidMovesForRookOrBishop(0, 1, piece, chessboard))
    }
}
