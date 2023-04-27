import {ColorPiece, Moves, Positions, ValidMovesFunction} from "../Canvas/types";
import {canvasSize, squareSize, getCurrPos, getIndexAtPosition} from "../Canvas/utils";
import {Pawn} from "./Pawn";
import {Bishop} from "./Bishop";
import {King} from "./King";
import {Rook} from "./Rook";
import {Knight} from "./Knight";
import {Queen} from "./Queen";

// function to get all the positions where rooks, knights and bishops can move.
export function simulateMoves(indexArray: number[], board: Positions[],
                              pieceColors: ColorPiece[], validMovesFunction: ValidMovesFunction
) {
    let blackMoves: Moves[] = []
    let whiteMoves: Moves[] = []

    for (let index of indexArray){
        if (pieceColors[index].color === "white"){
            whiteMoves.push(...validMovesFunction(board[index]?.x, board[index]?.y, index, board, pieceColors))
        } else blackMoves.push(...validMovesFunction(board[index].x, board[index].y, index, board, pieceColors))
    }

    for (let index of Pawn.promotedPawns) {
        if (pieceColors[index]?.name === pieceColors[indexArray[0]].name) {
            if (pieceColors[index].color === "white") {
                whiteMoves = [...whiteMoves, ...(validMovesFunction(board[index].x, board[index].y, index, board, pieceColors))]
            } else {
                blackMoves = [...blackMoves, ...(validMovesFunction(board[index].x, board[index].y, index, board, pieceColors))]
            }
        }
    }
    return {blackMoves, whiteMoves}
}

export function getPossibleMovesForBishops(board: Positions[], pieceColors: ColorPiece[]){
    const bishop = new Bishop()
    return simulateMoves(bishop.Indexes, board, pieceColors, bishop.validMoves)
}

export function getPossibleMovesForRooks(board: Positions[], color_name_arr: ColorPiece[]){
    const rook = new Rook()
    return simulateMoves(rook.Indexes, board, color_name_arr, rook.validMoves)
}

export function getPossibleMovesForKnights(board: Positions[], color_name_arr: ColorPiece[]){
    const knight = new Knight()
    return simulateMoves(knight.Indexes, board, color_name_arr, knight.validMoves)
}

export function getPossibleMovesForQueens(board: Positions[], pieceColors: ColorPiece[]){
    const queen = new Queen()
    return simulateMoves([queen.whiteQueenIndex, queen.blackQueenIndex], board, pieceColors, queen.validMoves)
}

export function getPossibleMovesForKing(board: Positions[], pieceColors: ColorPiece[]){
    const king = new King()
    return simulateMoves([King.white_king.index, King.black_king.index], board, pieceColors, king.validMoves)
}

export function getPossibleMovesForPawns(board: Positions[], pieceColors: ColorPiece[]){
    let blackMoves: Moves[] = []
    let whiteMoves: Moves[] = []
    const pawn = new Pawn()

    let whiteIndex = pawn.leftMostWhitePawnIndex
    let blackIndex = pawn.leftMostBlackPawnIndex
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
        blackIndex += 4 // next black pawn
    }
    return {whiteMoves, blackMoves}
}

export function getPossibleMovesForAllBlackPieces(board: Positions[], pieceColors: ColorPiece[]){
    return [
        ...getPossibleMovesForRooks(board, pieceColors).blackMoves,
        ...getPossibleMovesForKnights(board, pieceColors).blackMoves,
        ...getPossibleMovesForBishops(board, pieceColors).blackMoves,
        ...getPossibleMovesForQueens(board, pieceColors).blackMoves,
        ...getPossibleMovesForPawns(board, pieceColors).blackMoves,
        ...getPossibleMovesForKing(board, pieceColors).blackMoves
    ]
}

export function getPossibleMovesForAllWhitePieces(board: Positions[], pieceColors: ColorPiece[]){
    return [
        ...getPossibleMovesForRooks(board, pieceColors).whiteMoves,
        ...getPossibleMovesForKnights(board, pieceColors).whiteMoves,
        ...getPossibleMovesForBishops(board, pieceColors).whiteMoves,
        ...getPossibleMovesForQueens(board, pieceColors).whiteMoves,
        ...getPossibleMovesForPawns(board, pieceColors).whiteMoves,
        ...getPossibleMovesForKing(board, pieceColors).whiteMoves
    ]
}
