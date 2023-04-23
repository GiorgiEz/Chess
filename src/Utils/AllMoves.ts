import {ColorPiece, Moves, Positions, ValidMovesFunction} from "./types";
import {bishopValidMoves} from "../Pieces/Bishop";
import {rookValidMoves} from "../Pieces/Rook";
import {knightValidMoves} from "../Pieces/Knight";
import {blackQueenIndex, whiteQueenIndex, queenValidMoves,} from "../Pieces/Queen";
import {kingValidMoves, black_king_index, white_king_index} from "../Pieces/King";
import {canvasSize, getCurrPos, getIndexAtPosition, squareSize} from "./utils";
import {leftMostBlackPawnIndex, leftMostWhitePawnIndex, promotedPawns} from "../Pieces/Pawn";

// function to get all the positions where rooks, knights and bishops can move.
export function simulateMoves(indexArray: number[],
    board: Positions[], pieceColors: ColorPiece[], validMovesFunction: ValidMovesFunction
) {
    let blackMoves: Moves[] = []
    let whiteMoves: Moves[] = []

    for (let index of indexArray){
        if (pieceColors[index].color === "white"){
            whiteMoves.push(...validMovesFunction(board[index].x, board[index].y, index, board, pieceColors))
        } else blackMoves.push(...validMovesFunction(board[index].x, board[index].y, index, board, pieceColors))
    }

    for (let index of promotedPawns) {
        if (pieceColors[index]?.name === pieceColors[indexArray[0]].name) {
            if (pieceColors[index].color === "white") {
                whiteMoves = [...whiteMoves, ...(validMovesFunction(board[index].x,
                    board[index].y, index, board, pieceColors))]
            } else {
                blackMoves = [...blackMoves, ...(validMovesFunction(board[index].x,
                    board[index].y, index, board, pieceColors))]
            }
        }
    }
    return {blackMoves, whiteMoves}
}

export function getPossibleMovesForBishops(board: Positions[], color_name_arr: ColorPiece[]){
    const bishopIndices = [11, 23, 8, 20]
    return simulateMoves(bishopIndices, board, color_name_arr, bishopValidMoves)
}

export function getPossibleMovesForRooks(board: Positions[], color_name_arr: ColorPiece[]){
    const rookIndices = [3, 31, 0, 28]
    return simulateMoves(rookIndices, board, color_name_arr, rookValidMoves)
}

export function getPossibleMovesForKnights(board: Positions[], color_name_arr: ColorPiece[]){
    const knightIndices = [7, 27, 4, 24]
    return simulateMoves(knightIndices, board, color_name_arr, knightValidMoves)
}

export function getPossibleMovesForQueens(board: Positions[], color_name_arr: ColorPiece[]){
    return simulateMoves([whiteQueenIndex, blackQueenIndex], board, color_name_arr, queenValidMoves)
}

export function getPossibleMovesForKing(board: Positions[], color_name_arr: ColorPiece[]){
    const white_king = {x: board[white_king_index].x, y: board[white_king_index].y}
    const black_king = {x: board[black_king_index].x, y: board[black_king_index].y}

    const whitePiece = kingValidMoves(white_king.x, white_king.y, white_king_index, board, color_name_arr)
    const blackPiece = kingValidMoves(black_king.x, black_king.y, black_king_index, board, color_name_arr)
    return {blackMoves:  [...blackPiece], whiteMoves: [...whitePiece]}
}

export function getPossibleMovesForPawns(board: Positions[], pieceColors: ColorPiece[]){
    let blackMoves: Moves[] = []
    let whiteMoves: Moves[] = []

    let whiteIndex = leftMostWhitePawnIndex
    let blackIndex = leftMostBlackPawnIndex
    while (whiteIndex < board.length){
        let {currX: currXWhite, currY: currYWhite} = getCurrPos(whiteIndex, board)
        let {currX: currXBlack, currY: currYBlack} = getCurrPos(blackIndex, board)

        const topLeftWhite = {
            x: currXWhite - squareSize,
            y: currYWhite - squareSize,
            index: getIndexAtPosition(currXWhite - squareSize, currYWhite - squareSize, board)
        }
        const topRightWhite = {
            x: currXWhite + squareSize,
            y: currYWhite - squareSize,
            index: getIndexAtPosition(currXWhite + squareSize, currYWhite - squareSize, board)
        }
        const topLeftBlack = {
            x: currXBlack - squareSize,
            y: currYBlack + squareSize,
            index: getIndexAtPosition(currXBlack - squareSize, currYBlack + squareSize, board)
        }
        const topRightBlack = {
            x: currXBlack + squareSize,
            y: currYBlack + squareSize,
            index: getIndexAtPosition(currXBlack + squareSize, currYBlack + squareSize, board)
        }

        if (pieceColors[getIndexAtPosition(currXWhite, currYWhite, board)].name === "pawn") {
            if (topLeftWhite.x >= 0 && topLeftWhite.x <= canvasSize && topLeftWhite.y >= 0 && topLeftWhite.y <= canvasSize) {
                whiteMoves.push(topLeftWhite)
            }
            if (topRightWhite.x >= 0 && topRightWhite.x <= canvasSize && topRightWhite.y >= 0 && topRightWhite.y <= canvasSize) {
                whiteMoves.push(topRightWhite)
            }
        }
        if (pieceColors[getIndexAtPosition(currXBlack, currYBlack, board)].name === "pawn") {
            if (topLeftBlack.x >= 0 && topLeftBlack.x <= canvasSize && topLeftBlack.y >= 0 && topLeftBlack.y <= canvasSize) {
                blackMoves.push(topLeftBlack)
            }
            if (topRightBlack.x >= 0 && topRightBlack.x <= canvasSize && topRightBlack.y >= 0 && topRightBlack.y <= canvasSize) {
                blackMoves.push(topRightBlack)
            }
        }
        whiteIndex += 4 // next white pawn
        blackIndex += 4 // next white pawn
    }
    return {whiteMoves, blackMoves}
}

export function getPossibleMovesForAllBlackPieces(board: Positions[], color_name_arr: ColorPiece[]){
    return [
        ...getPossibleMovesForRooks(board, color_name_arr).blackMoves,
        ...getPossibleMovesForKnights(board, color_name_arr).blackMoves,
        ...getPossibleMovesForBishops(board, color_name_arr).blackMoves,
        ...getPossibleMovesForQueens(board, color_name_arr).blackMoves,
        ...getPossibleMovesForPawns(board, color_name_arr).blackMoves,
        ...getPossibleMovesForKing(board, color_name_arr).blackMoves
    ]
}

export function getPossibleMovesForAllWhitePieces(board: Positions[], color_name_arr: ColorPiece[]){
    return [
        ...getPossibleMovesForRooks(board, color_name_arr).whiteMoves,
        ...getPossibleMovesForKnights(board, color_name_arr).whiteMoves,
        ...getPossibleMovesForBishops(board, color_name_arr).whiteMoves,
        ...getPossibleMovesForQueens(board, color_name_arr).whiteMoves,
        ...getPossibleMovesForPawns(board, color_name_arr).whiteMoves,
        ...getPossibleMovesForKing(board, color_name_arr).whiteMoves
    ]
}
