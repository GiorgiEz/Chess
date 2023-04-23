import {ColorPiece, Positions} from "../Utils/types";
import {rookValidMoves} from "./Rook";
import {bishopValidMoves} from "./Bishop";

export const whiteQueenIndex = 15
export const blackQueenIndex = 12

export function queenValidMoves (currX: number, currY: number, index: number, board: Positions[], color_name_arr: ColorPiece[]) {
    return [
        ...rookValidMoves(currX, currY, index, board, color_name_arr),
        ...bishopValidMoves(currX, currY, index, board, color_name_arr)
    ]
}