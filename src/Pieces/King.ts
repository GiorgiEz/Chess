import {AllMovesFunction, ColorPiece, Moves, Positions} from "../Utils/types";
import {correctMoves, getCurrPos, getIndexAtPosition, isPieceOnSquare, squareSize} from "../Utils/utils";

export const white_king_index = 19
export const black_king_index = 16

export function kingValidMoves(currX: number, currY: number, index: number, board: Positions[], pieceColorArray: ColorPiece[]) {
    const left = {
        x: currX - squareSize, y: currY,
        index: getIndexAtPosition(currX - squareSize, currY, board)
    }
    const right = {
        x: currX + squareSize, y: currY,
        index: getIndexAtPosition(currX + squareSize, currY, board)
    }
    const down = {
        x: currX, y: currY - squareSize,
        index: getIndexAtPosition(currX, currY - squareSize, board)
    }
    const up = {
        x: currX, y: currY + squareSize,
        index: getIndexAtPosition(currX, currY + squareSize, board)
    }
    const downLeft = {
        x: currX - squareSize, y: currY - squareSize,
        index: getIndexAtPosition(currX - squareSize, currY - squareSize, board)
    }
    const downRight = {
        x: currX + squareSize, y: currY - squareSize,
        index: getIndexAtPosition(currX + squareSize, currY - squareSize, board)
    }
    const upLeft = {
        x: currX - squareSize, y: currY + squareSize,
        index: getIndexAtPosition(currX - squareSize, currY + squareSize, board)
    }
    const upRight = {
        x: currX + squareSize, y: currY + squareSize,
        index: getIndexAtPosition(currX + squareSize, currY + squareSize, board)
    }
    return correctMoves([left, right, down, up, downLeft, downRight, upLeft, upRight], board, index, pieceColorArray)
}

//king cant move to the position where enemy pieces can move
export function kingMovementHandler(
    kingIndex: number, board: Positions[], color_name_arr: ColorPiece[], redSquares: Positions[],
    allMovesFunction: AllMovesFunction
) {
    const {currX, currY} = getCurrPos(kingIndex, board)
    const validMoves: Moves[] = []

    for (let move of kingValidMoves(currX, currY, kingIndex, board, color_name_arr)){
        const newBoard = board.map(pos => ({...pos}));

        const potentialKilledPiece = getIndexAtPosition(move.x, move.y, newBoard)
        newBoard[kingIndex] = {x: move.x, y: move.y}
        newBoard[potentialKilledPiece] = {x: -1000, y: -1000}

        let allBlackMoves = allMovesFunction(newBoard, color_name_arr)
        if (!isPieceOnSquare(move.x, move.y, allBlackMoves)) {
            if (potentialKilledPiece !== -1) redSquares.push({x: move.x, y: move.y})
            validMoves.push(move)
        }
    }
    return validMoves
}