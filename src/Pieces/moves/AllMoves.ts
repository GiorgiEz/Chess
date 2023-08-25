import {AlivePiece, ColorPiece, Moves, Positions, ValidMovesFunction} from "../../types";
import {getCurrPos, getIndexAtPosition,} from "../../Canvas/utils";
import {Pawn} from "../Pawn";
import {Bishop} from "../Bishop";
import {King} from "../King";
import {Rook} from "../Rook";
import {Knight} from "../Knight";
import {Queen} from "../Queen";
import {Pieces} from "../../exports";
import {movementHandler} from "./Movements";

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
    const indexes = []

    let whiteIndex = 2
    let blackIndex = 1
    while (whiteIndex < board.length){
        if (pieceColors[whiteIndex].name === Pieces.PAWN) indexes.push(whiteIndex)
        if (pieceColors[blackIndex].name === Pieces.PAWN) indexes.push(blackIndex)
        whiteIndex += 4 // next white pawn
        blackIndex += 4 // next black pawn
    }
    const pawn = new Pawn()
    return simulateMoves(indexes, board, pieceColors, pawn.validMoves)
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

export function getCurrentPositionsForAllPawns(board: Positions[], pieceColors: ColorPiece[]) {
    let blackPositions: Positions[] = []
    let whitePositions: Positions[] = []

    let whiteIndex = 2
    let blackIndex = 1

    while (whiteIndex < board.length) {
        let {currX: currXWhite, currY: currYWhite} = getCurrPos(whiteIndex, board)
        let {currX: currXBlack, currY: currYBlack} = getCurrPos(blackIndex, board)

        if (pieceColors[getIndexAtPosition(currXWhite, currYWhite, board)].name === Pieces.PAWN)
            whitePositions.push({x: currXWhite, y: currYWhite})
        if (pieceColors[getIndexAtPosition(currXBlack, currYBlack, board)].name === Pieces.PAWN)
            blackPositions.push({x: currXBlack, y: currYBlack})

        whiteIndex += 4 // next white pawn
        blackIndex += 4 // next black pawn
    }
    return {whitePositions, blackPositions}
}

function allPossibleMovesHelper(i: number, whiteKing: Positions, blackKing: Positions, board: AlivePiece[],
                                pieceColors: ColorPiece[], redSquares: Positions[], validMoves: ValidMovesFunction){
    let moves: Moves[] = []

    if(pieceColors[i].color === "white") moves.push(...movementHandler(whiteKing, i, board, pieceColors, redSquares,
        getPossibleMovesForAllBlackPieces, validMoves))
    else moves.push(...movementHandler(blackKing, i, board, pieceColors, redSquares,
        getPossibleMovesForAllWhitePieces, validMoves))
    return moves
}

//Find all moves to determine if it's a checkmate or not
export function allPossibleMoves(board: AlivePiece[], pieceColors: ColorPiece[], redSquares: Positions[]){
    const whiteValidMoves: Moves[] = []
    const blackValidMoves: Moves[] = []
    const king = new King()

    let whiteKing = {x: board[King.white_king.index].x, y: board[King.white_king.index].y}
    let blackKing = {x: board[King.black_king.index].x, y: board[King.black_king.index].y}

    for (let i = 0; i < pieceColors.length; i++){
        let moves: Moves[] = [];

        switch (pieceColors[i].name){
            case Pieces.QUEEN:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, pieceColors, redSquares, new Queen().validMoves)
                break
            case Pieces.KING:
                if (pieceColors[i].color === "white") whiteValidMoves.push(...king.kingMovementHandler(King.white_king.index, redSquares,
                    board, pieceColors, getPossibleMovesForAllBlackPieces))
                else blackValidMoves.push(...king.kingMovementHandler(King.black_king.index, redSquares,
                    board, pieceColors, getPossibleMovesForAllWhitePieces))
                break
            case Pieces.PAWN:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, pieceColors, redSquares, new Pawn().validMoves)
                break
            case Pieces.ROOK:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, pieceColors, redSquares, new Rook().validMoves)
                break
            case Pieces.BISHOP:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, pieceColors, redSquares, new Bishop().validMoves)
                break
            case Pieces.KNIGHT:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, pieceColors, redSquares, new Knight().validMoves)
                break
        }
        if(pieceColors[i].color === "white") whiteValidMoves.push(...moves)
        else blackValidMoves.push(...moves)
    }
    return {whiteValidMoves, blackValidMoves}
}
