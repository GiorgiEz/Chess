import {PieceType, Positions} from "../Utils/types";
import {getValidMovesForRookOrBishop} from "./moves/Movements";

export class Bishop{
    validMoves(piece: PieceType, chessboard: PieceType[]): Positions[] {
        return getValidMovesForRookOrBishop(1, 1, piece, chessboard)
            .concat(getValidMovesForRookOrBishop(1, -1, piece, chessboard))
            .concat(getValidMovesForRookOrBishop(-1, 1, piece, chessboard))
            .concat(getValidMovesForRookOrBishop(-1, -1, piece, chessboard))
    }
}
