import {PieceType, Positions, ValidMovesFunction} from "../../Utils/types";
import {Pawn} from "../Pawn";
import {Bishop} from "../Bishop";
import {King} from "../King";
import {Rook} from "../Rook";
import {Knight} from "../Knight";
import {Queen} from "../Queen";
import {Pieces} from "../../Utils/exports";
import {movementHandler} from "./Movements";
import Game from "../../ChessBoard/Game";

const game = Game.getInstance();

// function to get all the positions where pieces can move
export function simulateMoves(pieces: PieceType[], validMovesFunction: ValidMovesFunction, chessboard: PieceType[]) {
    let blackMoves: Positions[] = []
    let whiteMoves: Positions[] = []

    for (let piece of pieces) {
        if (piece.color === "white") {
            whiteMoves.push(...validMovesFunction(piece, chessboard))
        } else {
            blackMoves.push(...validMovesFunction(piece, chessboard))
        }
    }
    return {blackMoves, whiteMoves}
}

export function getPossibleMovesForBishops(chessboard: PieceType[]){
    const bishop = new Bishop()
    const allBishops = chessboard.filter((piece) => piece.name === Pieces.BISHOP)
    return simulateMoves(allBishops, bishop.validMoves.bind(bishop), chessboard)
}

export function getPossibleMovesForRooks(chessboard: PieceType[]){
    const rook = new Rook()
    const allRooks = chessboard.filter((piece) => piece.name === Pieces.ROOK)
    return simulateMoves(allRooks, rook.validMoves.bind(rook), chessboard)
}

export function getPossibleMovesForKnights(chessboard: PieceType[]){
    const knight = new Knight()
    const allKnights = chessboard.filter((piece) => piece.name === Pieces.KNIGHT)
    return simulateMoves(allKnights, knight.validMoves.bind(knight), chessboard)
}

export function getPossibleMovesForQueens(chessboard: PieceType[]){
    const queen = new Queen()
    const allQueens = chessboard.filter((piece) => piece.name === Pieces.QUEEN)
    return simulateMoves(allQueens, queen.validMoves.bind(queen), chessboard)
}

export function getPossibleMovesForKing(chessboard: PieceType[]){
    const king = new King()
    const allKings = chessboard.filter((piece) => piece.name === Pieces.KING)
    return simulateMoves(allKings, king.validMoves.bind(king), chessboard)
}

export function getPossibleMovesForPawns(chessboard: PieceType[]){
    const pawn = new Pawn()
    const allPawns = chessboard.filter((piece) => piece.name === Pieces.PAWN)
    return simulateMoves(allPawns, pawn.validMoves.bind(pawn), chessboard)
}

export function getPossibleMovesForAllBlackPieces(chessboard: PieceType[]){
    return [
        ...getPossibleMovesForRooks(chessboard).blackMoves, ...getPossibleMovesForKnights(chessboard).blackMoves,
        ...getPossibleMovesForBishops(chessboard).blackMoves, ...getPossibleMovesForQueens(chessboard).blackMoves,
        ...getPossibleMovesForPawns(chessboard).blackMoves, ...getPossibleMovesForKing(chessboard).blackMoves
    ]
}

export function getPossibleMovesForAllWhitePieces(chessboard: PieceType[]){
    return [
        ...getPossibleMovesForRooks(chessboard).whiteMoves, ...getPossibleMovesForKnights(chessboard).whiteMoves,
        ...getPossibleMovesForBishops(chessboard).whiteMoves, ...getPossibleMovesForQueens(chessboard).whiteMoves,
        ...getPossibleMovesForPawns(chessboard).whiteMoves, ...getPossibleMovesForKing(chessboard).whiteMoves
    ]
}

export function allPossibleMovesHelper(piece: PieceType, validMoves: ValidMovesFunction){
    if(piece.color === "white") {
        return movementHandler(King.getWhiteKing(game.chessboard), piece, getPossibleMovesForAllBlackPieces, validMoves)
    }
    else {
        return movementHandler(King.getBlackKing(game.chessboard), piece, getPossibleMovesForAllWhitePieces, validMoves)
    }
}

//Find all moves to determine if it's a checkmate or not
export function allPossibleMoves(){
    const whiteValidMoves: Positions[] = []
    const blackValidMoves: Positions[] = []

        for (let piece of game.chessboard) {
            let moves: Positions[] = [];
            switch (piece.name) {
                case Pieces.KING:
                    const king = new King()
                    if (piece.color === "white") {
                        whiteValidMoves.push(...king.kingMovementHandler(King.getWhiteKing(game.chessboard),
                            getPossibleMovesForAllBlackPieces))
                    } else {
                        blackValidMoves.push(...king.kingMovementHandler(King.getBlackKing(game.chessboard),
                            getPossibleMovesForAllWhitePieces))
                    }
                    break
                case Pieces.QUEEN:
                    const queen = new Queen()
                    moves = allPossibleMovesHelper(piece, queen.validMoves.bind(queen))
                    break
                case Pieces.PAWN:
                    const pawn = new Pawn()
                    moves = allPossibleMovesHelper(piece, pawn.validMoves.bind(pawn))
                    break
                case Pieces.ROOK:
                    const rook = new Rook()
                    moves = allPossibleMovesHelper(piece, rook.validMoves.bind(rook))
                    break
                case Pieces.BISHOP:
                    const bishop = new Bishop()
                    moves = allPossibleMovesHelper(piece, bishop.validMoves.bind(bishop))
                    break
                case Pieces.KNIGHT:
                    const knight = new Knight()
                    moves = allPossibleMovesHelper(piece, knight.validMoves.bind(knight))
                    break
            }
            if(piece.color === "white") {
                whiteValidMoves.push(...moves)
            }
            else {
                blackValidMoves.push(...moves)
            }
        }
    return {whiteValidMoves, blackValidMoves}
}
