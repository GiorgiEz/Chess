import {Moves, ColorPiece, Positions} from "../Utils/types";
import {getValidMovesForRookOrBishop} from "../Utils/utils";

export function rookValidMoves(currX: number, currY: number, index: number, board: Positions[], color_name_arr: ColorPiece[]){
    let validMoves: Moves[] = [];

    validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, 0, currX, currY, index, board, color_name_arr));
    validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, 0, currX, currY, index, board, color_name_arr));
    validMoves = validMoves.concat(getValidMovesForRookOrBishop(0, -1, currX, currY, index, board, color_name_arr));
    validMoves = validMoves.concat(getValidMovesForRookOrBishop(0, 1, currX, currY, index, board, color_name_arr));
    return validMoves
}
