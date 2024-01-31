import {AllMovesFunction, ColorPiece, Moves, PieceType, Positions, ValidMoves, ValidMovesFunction} from "../../types";
import {King} from "../King";
import {getPossibleMovesForAllBlackPieces, getPossibleMovesForAllWhitePieces} from "./AllMoves";
import {getCurrPos, getIndexAtPosition, isPieceOnSquare} from "../../utils";
import {canvasSize, squareSize} from "../../exports";

// Don't let a piece make illegal move if the king is or will be in danger
export function movementHandler(
    king: Positions, draggingIndex: number, board: PieceType[], redSquares: Positions[],
    allMovesFunction: AllMovesFunction, validMovesFunction: ValidMovesFunction
) {
    const {currX, currY} = getCurrPos(draggingIndex, board)
    const index = getIndexAtPosition(currX, currY, board)
    const updatedValidMoves = []
    for (let move of validMovesFunction(currX, currY, index, board)) {
        const newBoard = board.map(pos => ({...pos}));

        const potentiallyKilledPiece = getIndexAtPosition(move.x, move.y, newBoard)
        newBoard[index] = {...newBoard[index], x: move.x, y: move.y}
        newBoard[potentiallyKilledPiece] = {...newBoard[potentiallyKilledPiece], x: -1000, y: -1000}

        const allMoves = allMovesFunction(newBoard)
        if (!isPieceOnSquare(king.x, king.y, allMoves)) {
            if (potentiallyKilledPiece !== -1) redSquares.push({x: move.x, y: move.y})
            updatedValidMoves.push(move)
        }
    }
    return updatedValidMoves
}

// Get legal moves for pieces with movementHandler function
export function pieceMovementHandler
(piece: ValidMoves, board: PieceType[], draggingIndex: number, redSquares: Positions[]
) {
    let whiteKing = {x: board[King.white_king.index].x, y: board[King.white_king.index].y}
    let blackKing = {x: board[King.black_king.index].x, y: board[King.black_king.index].y}

    if (board[draggingIndex].color === "white") {
        return movementHandler(whiteKing, draggingIndex, board, redSquares, getPossibleMovesForAllBlackPieces, piece.validMoves)
    }
    else return movementHandler(blackKing, draggingIndex, board, redSquares, getPossibleMovesForAllWhitePieces, piece.validMoves)
}

export function getValidMovesForRookOrBishop (
    dx: number, dy: number, currX: number, currY: number, dragIndex: number, board: PieceType[]
) {
    let validMoves: Moves[] = [];
    for (let square = squareSize; square < canvasSize; square += squareSize) {
        const x = currX + square * dx;
        const y = currY + square * dy;
        const index = getIndexAtPosition(x, y, board);

        if (x >= 0 && x <= canvasSize && y >= 0 && y <= canvasSize) {
            const sameColors = board[index]?.color === board[dragIndex]?.color;
            if (isPieceOnSquare(x, y, board) && sameColors) break;
            else if (isPieceOnSquare(x, y, board) && !sameColors) {validMoves.push({x, y, index});break;}
            validMoves.push({x, y, index});
        }
    }
    return validMoves;
}

// check if position where the king or the knight can move isn't blocked by same colored piece
export function getValidMovesForKnightOrKing(moves: Moves[], board: PieceType[], dragIndex: number) {
    let validMoves: Moves[] = []
    for (let i = 0; i < moves.length; i++){
        const move = {x: moves[i].x, y: moves[i].y, index: moves[i].index}
        if (move.x >= 0 && move.x <= canvasSize && move.y >= 0 && move.y <= canvasSize) {
            const sameColors = board[move.index]?.color === board[dragIndex].color
            if (!isPieceOnSquare(move.x, move.y, board)) validMoves.push(move)
            else if (isPieceOnSquare(move.x, move.y, board) && !sameColors) validMoves.push(move)
        }
    }
    return validMoves
}
