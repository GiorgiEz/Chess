import {Moves, ColorPiece, Positions} from "../Canvas/types";
import {getValidMovesForRookOrBishop} from "../Canvas/utils";

export class Rook{
    Indexes = [3, 31, 0, 28]

    //initial positions for each rook
    static leftWhiteRook = {x: 12.5, y: 537.5, index: 3, hasMoved: false}
    static rightWhiteRook = {x: 537.5, y: 537.5, index: 31, hasMoved: false}
    static leftBlackRook = {x: 12.5, y: 12.5, index: 0, hasMoved: false}
    static rightBlackRook = {x: 537.5, y: 12.5, index: 28, hasMoved: false}

    validMoves(x: number, y: number, index: number, board: Positions[], pieceColors: ColorPiece[]): Moves[] {
        return getValidMovesForRookOrBishop(-1, 0, x, y, index, board, pieceColors)
            .concat(getValidMovesForRookOrBishop(1, 0, x, y, index, board, pieceColors))
            .concat(getValidMovesForRookOrBishop(0, -1, x, y, index, board, pieceColors))
            .concat(getValidMovesForRookOrBishop(0, 1, x, y, index, board, pieceColors))
    }
}
