import {ColorPiece, Moves, PieceType, Positions, ValidMovesFunction} from "../../types";
import {getCurrPos, getIndexAtPosition,} from "../../utils";
import {Pawn} from "../Pawn";
import {Bishop} from "../Bishop";
import {King} from "../King";
import {Rook} from "../Rook";
import {Knight} from "../Knight";
import {Queen} from "../Queen";
import {Pieces} from "../../exports";
import {movementHandler} from "./Movements";

// function to get all the positions where pieces can move
export function simulateMoves(indexArray: number[], board: PieceType[], validMovesFunction: ValidMovesFunction) {
    let blackMoves: Moves[] = []
    let whiteMoves: Moves[] = []

    for (let index of indexArray){
        if (board[index].color === "white"){
            whiteMoves.push(...validMovesFunction(board[index]?.x, board[index]?.y, index, board))
        } else {
            blackMoves.push(...validMovesFunction(board[index].x, board[index].y, index, board))
        }
    }

    for (let index of Pawn.promotedPawns) {
        if (board[index]?.name === board[indexArray[0]].name) {
            if (board[index].color === "white") {
                whiteMoves = [...whiteMoves, ...(validMovesFunction(board[index].x, board[index].y, index, board))]
            } else {
                blackMoves = [...blackMoves, ...(validMovesFunction(board[index].x, board[index].y, index, board))]
            }
        }
    }
    return {blackMoves, whiteMoves}
}

export function getPossibleMovesForBishops(board: PieceType[]){
    const bishop = new Bishop()
    return simulateMoves(bishop.Indexes, board, bishop.validMoves)
}

export function getPossibleMovesForRooks(board: PieceType[]){
    const rook = new Rook()
    return simulateMoves(rook.Indexes, board, rook.validMoves)
}

export function getPossibleMovesForKnights(board: PieceType[]){
    const knight = new Knight()
    return simulateMoves(knight.Indexes, board, knight.validMoves)
}

export function getPossibleMovesForQueens(board: PieceType[]){
    const queen = new Queen()
    return simulateMoves(queen.Indexes, board, queen.validMoves)
}

export function getPossibleMovesForKing(board: PieceType[]){
    const king = new King()
    return simulateMoves([King.white_king.index, King.black_king.index], board, king.validMoves)
}

export function getPossibleMovesForPawns(board: PieceType[]){
    const indexes = []

    let whiteIndex = 2
    let blackIndex = 1
    while (whiteIndex < board.length){
        if (board[whiteIndex].name === Pieces.PAWN) {
            indexes.push(whiteIndex)
        }
        if (board[blackIndex].name === Pieces.PAWN) {
            indexes.push(blackIndex)
        }
        whiteIndex += 4 // next white pawn
        blackIndex += 4 // next black pawn
    }
    const pawn = new Pawn()
    return simulateMoves(indexes, board, pawn.validMoves)
}

export function getPossibleMovesForAllBlackPieces(board: PieceType[]){
    return [
        ...getPossibleMovesForRooks(board).blackMoves,
        ...getPossibleMovesForKnights(board).blackMoves,
        ...getPossibleMovesForBishops(board).blackMoves,
        ...getPossibleMovesForQueens(board).blackMoves,
        ...getPossibleMovesForPawns(board).blackMoves,
        ...getPossibleMovesForKing(board).blackMoves
    ]
}

export function getPossibleMovesForAllWhitePieces(board: PieceType[]){
    return [
        ...getPossibleMovesForRooks(board).whiteMoves,
        ...getPossibleMovesForKnights(board).whiteMoves,
        ...getPossibleMovesForBishops(board).whiteMoves,
        ...getPossibleMovesForQueens(board).whiteMoves,
        ...getPossibleMovesForPawns(board).whiteMoves,
        ...getPossibleMovesForKing(board).whiteMoves
    ]
}

export function getCurrentPositionsForAllPawns(board: PieceType[]) {
    let blackPositions: Positions[] = []
    let whitePositions: Positions[] = []

    let whiteIndex = 2
    let blackIndex = 1

    while (whiteIndex < board.length) {
        let {currX: currXWhite, currY: currYWhite} = getCurrPos(whiteIndex, board)
        let {currX: currXBlack, currY: currYBlack} = getCurrPos(blackIndex, board)

        if (board[getIndexAtPosition(currXWhite, currYWhite, board)].name === Pieces.PAWN)
            whitePositions.push({x: currXWhite, y: currYWhite})
        if (board[getIndexAtPosition(currXBlack, currYBlack, board)].name === Pieces.PAWN)
            blackPositions.push({x: currXBlack, y: currYBlack})

        whiteIndex += 4 // next white pawn
        blackIndex += 4 // next black pawn
    }
    return {whitePositions, blackPositions}
}

function allPossibleMovesHelper(i: number, whiteKing: Positions, blackKing: Positions, board: PieceType[],
                                redSquares: Positions[], validMoves: ValidMovesFunction){
    let moves: Moves[] = []

    if(board[i].color === "white") {
        moves.push(...movementHandler(whiteKing, i, board, redSquares,
            getPossibleMovesForAllBlackPieces, validMoves))
    }
    else {
        moves.push(...movementHandler(blackKing, i, board, redSquares,
            getPossibleMovesForAllWhitePieces, validMoves))
    }
    return moves
}

//Find all moves to determine if it's a checkmate or not
export function allPossibleMoves(board: PieceType[], redSquares: Positions[]){
    const whiteValidMoves: Moves[] = []
    const blackValidMoves: Moves[] = []
    const king = new King()

    let whiteKing = {x: board[King.white_king.index].x, y: board[King.white_king.index].y}
    let blackKing = {x: board[King.black_king.index].x, y: board[King.black_king.index].y}

    for (let i = 0; i < board.length; i++){
        let moves: Moves[] = [];

        switch (board[i].name){
            case Pieces.QUEEN:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, redSquares, new Queen().validMoves)
                break
            case Pieces.KING:
                if (board[i].color === "white") whiteValidMoves.push(...king.kingMovementHandler(King.white_king.index, redSquares,
                    board, board, getPossibleMovesForAllBlackPieces))
                else blackValidMoves.push(...king.kingMovementHandler(King.black_king.index, redSquares,
                    board, board, getPossibleMovesForAllWhitePieces))
                break
            case Pieces.PAWN:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, redSquares, new Pawn().validMoves)
                break
            case Pieces.ROOK:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, redSquares, new Rook().validMoves)
                break
            case Pieces.BISHOP:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, redSquares, new Bishop().validMoves)
                break
            case Pieces.KNIGHT:
                moves = allPossibleMovesHelper(i, whiteKing, blackKing, board, redSquares, new Knight().validMoves)
                break
        }
        if(board[i].color === "white") {
            whiteValidMoves.push(...moves)
        }
        else {
            blackValidMoves.push(...moves)
        }
    }
    return {whiteValidMoves, blackValidMoves}
}
