import {ColorPiece, Positions} from "../Utils/types";
import {correctMoves, getIndexAtPosition, squareSize} from "../Utils/utils";

export function knightValidMoves
    (currX: number, currY: number, index: number, board: Positions[], color_name_arr: ColorPiece[]) {
    const upLeft = {x: currX - squareSize, y: currY + 2 * squareSize,
        index: getIndexAtPosition(currX - squareSize, currY + 2 * squareSize, board)}

    const upRight = {x: currX + squareSize, y: currY + 2 * squareSize,
        index: getIndexAtPosition(currX + squareSize, currY + 2 * squareSize, board)}

    const leftUp = {x: currX - 2 * squareSize, y: currY + squareSize,
        index: getIndexAtPosition(currX - 2 * squareSize, currY + squareSize, board)}

    const leftDown = {x: currX - 2 * squareSize, y: currY - squareSize,
        index: getIndexAtPosition(currX - 2 * squareSize, currY - squareSize, board)}

    const downLeft = {x: currX - squareSize, y: currY - 2 * squareSize,
        index: getIndexAtPosition(currX - squareSize, currY - 2 * squareSize, board)}

    const downRight = {x: currX + squareSize, y: currY - 2 * squareSize,
        index: getIndexAtPosition(currX + squareSize, currY - 2 * squareSize, board)}

    const rightDown = {x: currX + 2 * squareSize, y: currY - squareSize,
        index: getIndexAtPosition(currX + 2 * squareSize, currY - squareSize, board)}

    const rightUp = {x: currX + 2 * squareSize, y: currY + squareSize,
        index: getIndexAtPosition(currX + 2 * squareSize, currY + squareSize, board)}

    return correctMoves([upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp],
        board, index, color_name_arr)
}
