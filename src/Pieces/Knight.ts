import {ColorPiece, Positions} from "../Canvas/types";
import {availableMoves, getIndexAtPosition, squareSize} from "../Canvas/utils";

export class Knight{
    //7 and 27 is for white bishops and 4 and 24 is for black bishops
    Indexes = [7, 27, 4, 24]

    validMoves(currX: number, currY: number, index: number, board: Positions[], pieceColors: ColorPiece[]) {
        const upLeft = {
            x: currX - squareSize, y: currY + 2 * squareSize,
            index: getIndexAtPosition(currX - squareSize, currY + 2 * squareSize, board)
        }

        const upRight = {
            x: currX + squareSize, y: currY + 2 * squareSize,
            index: getIndexAtPosition(currX + squareSize, currY + 2 * squareSize, board)
        }

        const leftUp = {
            x: currX - 2 * squareSize, y: currY + squareSize,
            index: getIndexAtPosition(currX - 2 * squareSize, currY + squareSize, board)
        }

        const leftDown = {
            x: currX - 2 * squareSize, y: currY - squareSize,
            index: getIndexAtPosition(currX - 2 * squareSize, currY - squareSize, board)
        }

        const downLeft = {
            x: currX - squareSize, y: currY - 2 * squareSize,
            index: getIndexAtPosition(currX - squareSize, currY - 2 * squareSize, board)
        }

        const downRight = {
            x: currX + squareSize, y: currY - 2 * squareSize,
            index: getIndexAtPosition(currX + squareSize, currY - 2 * squareSize, board)
        }

        const rightDown = {
            x: currX + 2 * squareSize, y: currY - squareSize,
            index: getIndexAtPosition(currX + 2 * squareSize, currY - squareSize, board)
        }

        const rightUp = {
            x: currX + 2 * squareSize, y: currY + squareSize,
            index: getIndexAtPosition(currX + 2 * squareSize, currY + squareSize, board)
        }

        return availableMoves([upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp],
            board, index, pieceColors)
    }
}
