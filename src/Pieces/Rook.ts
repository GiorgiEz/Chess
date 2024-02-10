import {PieceType, Positions} from "../Utils/types";
import {getValidMovesForRookOrBishop} from "./moves/Movements";
import {Pieces} from "../Utils/exports";
import Game from "../ChessBoard/Game";

export class Rook{
    private game: Game;
    static hasLeftWhiteRookMoved = false
    static hasRightWhiteRookMoved = false
    static hasLeftBlackRookMoved = false
    static hasRightBlackRookMoved = false

    constructor() {
        this.game = Game.getInstance();
    }

    static getLeftWhiteRook(pieces: any){
        return pieces.get(Pieces.ROOK)?.filter((rook: PieceType) => rook.color === "white")[0]
    }

    static getRightWhiteRook(pieces: any){
        return pieces.get(Pieces.ROOK)?.filter((rook: PieceType) => rook.color === "white")[1]
    }

    static getLeftBlackRook(pieces: any){
        return pieces.get(Pieces.ROOK)?.filter((rook: PieceType) => rook.color === "black")[0]
    }

    static getRightBlackRook(pieces: any){
        return pieces.get(Pieces.ROOK)?.filter((rook: PieceType) => rook.color === "black")[1]
    }


    validMoves(piece: PieceType, chessboard: PieceType[]): Positions[] {
        return getValidMovesForRookOrBishop(-1, 0, piece, chessboard)
            .concat(getValidMovesForRookOrBishop(1, 0, piece, chessboard))
            .concat(getValidMovesForRookOrBishop(0, -1, piece, chessboard))
            .concat(getValidMovesForRookOrBishop(0, 1, piece, chessboard))
    }
}
