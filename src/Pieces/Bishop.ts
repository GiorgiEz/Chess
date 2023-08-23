import {ColorPiece, Moves, Positions} from "../types";
import {getValidMovesForRookOrBishop} from "./Movements";

export class Bishop {
    //11 and 23 is for white bishops and 8 and 20 is for black bishops
    Indexes = [11, 23, 8, 20];

    validMoves(x: number, y: number, index: number, board: Positions[], pieceColors: ColorPiece[]): Moves[] {
        return getValidMovesForRookOrBishop(1, 1, x, y, index, board, pieceColors)
            .concat(getValidMovesForRookOrBishop(1, -1, x, y, index, board, pieceColors))
            .concat(getValidMovesForRookOrBishop(-1, 1, x, y, index, board, pieceColors))
            .concat(getValidMovesForRookOrBishop(-1, -1, x, y, index, board, pieceColors))
    }
}
