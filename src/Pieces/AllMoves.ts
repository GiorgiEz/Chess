import {ColorPiece, Moves, Positions, ValidMovesFunction} from "../Canvas/types";
import {getCurrPos, getIndexAtPosition, movementHandler, squareSize, canvasSize} from "../Canvas/utils";
import {Pawn} from "./Pawn";
import {Bishop} from "./Bishop";
import {King} from "./King";
import {Rook} from "./Rook";
import {Knight} from "./Knight";
import {Queen} from "./Queen";

// function to get all the positions where pieces can move
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
    return simulateMoves(queen.Indexes, board, pieceColors, queen.validMoves)
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

//Find all moves to determine if it's a checkmate or not
export function allPossibleMoves(positions: Positions[], pieceColors: ColorPiece[], redSquares: Positions[]){
    const whiteValidMoves = []
    const blackValidMoves = []
    const king = new King()

    let whiteKing = {x: positions[King.white_king.index].x, y: positions[King.white_king.index].y}
    let blackKing = {x: positions[King.black_king.index].x, y: positions[King.black_king.index].y}

    for (let i = 0; i < pieceColors.length; i++){
        if (pieceColors[i].color === "white"){
            switch (pieceColors[i].name){
                case "queen":
                    whiteValidMoves.push(...movementHandler(whiteKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllBlackPieces, new Queen().validMoves))
                    break
                case "king":
                    whiteValidMoves.push(...king.kingMovementHandler(King.white_king.index, redSquares,
                        positions, pieceColors, getPossibleMovesForAllBlackPieces))
                    break
                case "pawn":
                    whiteValidMoves.push(...movementHandler(whiteKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllBlackPieces, new Pawn().validMoves))
                    break
                case "rook":
                    whiteValidMoves.push(...movementHandler(whiteKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllBlackPieces, new Rook().validMoves))
                    break
                case "bishop":
                    whiteValidMoves.push(...movementHandler(whiteKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllBlackPieces, new Bishop().validMoves))
                    break
                case "knight":
                    whiteValidMoves.push(...movementHandler(whiteKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllBlackPieces, new Knight().validMoves))
                    break
            }
        } else {
            switch (pieceColors[i].name){
                case "queen":
                    blackValidMoves.push(...movementHandler(blackKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllWhitePieces, new Queen().validMoves))
                    break
                case "king":
                    blackValidMoves.push(...king.kingMovementHandler(King.black_king.index, redSquares,
                        positions, pieceColors, getPossibleMovesForAllWhitePieces))
                    break
                case "pawn":
                    blackValidMoves.push(...movementHandler(blackKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllWhitePieces, new Pawn().validMoves))
                    break
                case "rook":
                    blackValidMoves.push(...movementHandler(blackKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllWhitePieces, new Rook().validMoves))
                    break
                case "bishop":
                    blackValidMoves.push(...movementHandler(blackKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllWhitePieces, new Bishop().validMoves))
                    break
                case "knight":
                    blackValidMoves.push(...movementHandler(blackKing, i, positions, pieceColors, redSquares,
                        getPossibleMovesForAllWhitePieces, new Knight().validMoves))
                    break
            }
        }
    }
    return {whiteValidMoves, blackValidMoves}
}
