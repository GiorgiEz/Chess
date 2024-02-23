import {PieceType, Positions, ValidMovesFunction} from "../Utils/types";
import {Pawn} from "./Pawn";
import {Bishop} from "./Bishop";
import {King} from "./King";
import {Rook} from "./Rook";
import {Knight} from "./Knight";
import {Queen} from "./Queen";
import {Pieces} from "../Utils/exports";
import Game from "../Game/Game";
import {getPieceAtPosition, isPieceOnSquare} from "../Utils/utilFunctions";

const game = Game.getInstance();

// Don't let a piece make illegal move if the king is or will be in danger
export function filterMovesByCheckingKingSafety(piece: PieceType, validMovesFunction: ValidMovesFunction) {
    const updatedValidMoves = []
    const isWhite = piece.color === "white"
    const king = isWhite ? King.getWhiteKing(game.chessboard) : King.getBlackKing(game.chessboard)
    const isKing = king.name === piece.name

    for (let move of validMovesFunction(piece, game.chessboard)) {
        let chessboardCopy = game.chessboard.map(pos => ({...pos}));

        const potentiallyKilledPiece = getPieceAtPosition(move.x, move.y)
        if (potentiallyKilledPiece) {
            chessboardCopy[potentiallyKilledPiece.index] = {...potentiallyKilledPiece, x: -1000, y: -1000}
        }
        chessboardCopy[piece.index] = {...piece, x: move.x, y: move.y};

        const allMoves = isWhite ? allPotentialMoves(chessboardCopy).blackValidMoves : allPotentialMoves(chessboardCopy).whiteValidMoves
        if (!isPieceOnSquare(isKing ? move.x : king.x, isKing ? move.y : king.y, allMoves)) {
            if (potentiallyKilledPiece !== null && potentiallyKilledPiece.color !== piece.color) {
                game.threatenedSquares.push(move)
            }
            updatedValidMoves.push(move)
        }
    }
    return updatedValidMoves
}

export function allPotentialMoves(chessboard: PieceType[] = game.chessboard, kingCall = false){
    const whiteValidMoves: Positions[] = []
    const blackValidMoves: Positions[] = []

    for (let piece of chessboard) {
        let moves: Positions[] = [];
        switch (piece.name) {
            case Pieces.KING:
                if (kingCall) break
                const king = new King()
                moves = king.validMoves(piece, chessboard)
                break
            case Pieces.QUEEN:
                const queen = new Queen()
                moves = queen.validMoves(piece, chessboard)
                break
            case Pieces.PAWN:
                const pawn = new Pawn()
                moves = pawn.validMoves(piece, chessboard)
                break
            case Pieces.ROOK:
                const rook = new Rook()
                moves = rook.validMoves(piece, chessboard)
                break
            case Pieces.BISHOP:
                const bishop = new Bishop()
                moves = bishop.validMoves(piece, chessboard)
                break
            case Pieces.KNIGHT:
                const knight = new Knight()
                moves = knight.validMoves(piece, chessboard)
                break
            default: break;
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

//Find all moves to determine if it's a checkmate or not
export function FilterAllPotentialMoves(chessboard = game.chessboard){
    const whiteValidMoves = []
    const blackValidMoves = []

    for (let piece of chessboard) {
        let moves: Positions[] = [];

        switch (piece.name) {
            case Pieces.KING:
                const king = new King()
                moves = filterMovesByCheckingKingSafety(piece, king.validMoves.bind(king))
                break
            case Pieces.QUEEN:
                const queen = new Queen()
                moves = filterMovesByCheckingKingSafety(piece, queen.validMoves.bind(queen))
                break
            case Pieces.PAWN:
                const pawn = new Pawn()
                moves = filterMovesByCheckingKingSafety(piece, pawn.validMoves.bind(pawn))
                break
            case Pieces.ROOK:
                const rook = new Rook()
                moves = filterMovesByCheckingKingSafety(piece, rook.validMoves.bind(rook))
                break
            case Pieces.BISHOP:
                const bishop = new Bishop()
                moves = filterMovesByCheckingKingSafety(piece, bishop.validMoves.bind(bishop))
                break
            case Pieces.KNIGHT:
                const knight = new Knight()
                moves = filterMovesByCheckingKingSafety(piece, knight.validMoves.bind(knight))
                break
            default: break;
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
