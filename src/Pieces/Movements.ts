import {AllMovesFunction, ColorPiece, Moves, Positions, ValidMoves, ValidMovesFunction} from "../types";
import {King} from "./King";
import {getPossibleMovesForAllBlackPieces, getPossibleMovesForAllWhitePieces} from "./AllMoves";
import {getCurrPos, getIndexAtPosition, isPieceOnSquare} from "../Canvas/utils";
import {boardHeight, canvasWidth, squareSize} from "../exports";

// Exclude pieces from making illegal moves if king is or will be in danger
export function movementHandler(
    king: Positions, draggingIndex: number, board: Positions[], pieceColors: ColorPiece[], redSquares: Positions[],
    allMovesFunction: AllMovesFunction, validMovesFunction: ValidMovesFunction
) {
    const {currX, currY} = getCurrPos(draggingIndex, board)
    const index = getIndexAtPosition(currX, currY, board)
    const updatedValidMoves = []
    for (let move of validMovesFunction(currX, currY, index, board, pieceColors)) {
        const newBoard = board.map(pos => ({...pos}));

        const potentialKilledPiece = getIndexAtPosition(move.x, move.y, newBoard)
        newBoard[index] = {x: move.x, y: move.y}
        newBoard[potentialKilledPiece] = {x: -1000, y: -1000}

        const allMoves = allMovesFunction(newBoard, pieceColors)
        if (!isPieceOnSquare(king.x, king.y, allMoves)) {
            if (potentialKilledPiece !== -1) redSquares.push({x: move.x, y: move.y})
            updatedValidMoves.push(move)
        }
    }
    return updatedValidMoves
}

// Get legal moves for pieces with movementHandler function
export function pieceMovementHandler
(piece: ValidMoves, board: Positions[], pieceColors: ColorPiece[], draggingIndex: number, redSquares: Positions[]
) {
    let whiteKing = {x: board[King.white_king.index].x, y: board[King.white_king.index].y}
    let blackKing = {x: board[King.black_king.index].x, y: board[King.black_king.index].y}

    if (pieceColors[draggingIndex].color === "white") {
        return movementHandler(whiteKing, draggingIndex, board, pieceColors, redSquares,
            getPossibleMovesForAllBlackPieces, piece.validMoves)
    }
    else return movementHandler(blackKing, draggingIndex, board, pieceColors, redSquares,
        getPossibleMovesForAllWhitePieces, piece.validMoves)
}

export function getValidMovesForRookOrBishop (
    dx: number, dy: number, currX: number, currY: number, dragIndex: number, board: Positions[], color_name_arr: ColorPiece[]
) {
    let validMoves: Moves[] = [];
    for (let square = squareSize; square < boardHeight; square += squareSize) {
        const x = currX + square * dx;
        const y = currY + square * dy;
        const index = getIndexAtPosition(x, y, board);

        if (x >= squareSize && x <= canvasWidth-squareSize && y >= 0 && y <= boardHeight) {
            const sameColors = color_name_arr[index]?.color === color_name_arr[dragIndex]?.color;
            if (isPieceOnSquare(x, y, board) && sameColors) break;
            else if (isPieceOnSquare(x, y, board) && !sameColors) {validMoves.push({x, y, index});break;}
            validMoves.push({x, y, index});
        }
    }
    return validMoves;
}

// check if position where the king or the knight can move isn't blocked by same colored piece
export function getValidMovesForKnightOrKing(moves: Moves[], board: Positions[], dragIndex: number, color_name_arr: ColorPiece[]) {
    let validMoves: Moves[] = []
    for (let i = 0; i < moves.length; i++){
        const move = {x: moves[i].x, y: moves[i].y, index: moves[i].index}
        if (move.x >= squareSize && move.x <= canvasWidth-squareSize && move.y >= 0 && move.y <= boardHeight) {
            const sameColors = color_name_arr[move.index]?.color === color_name_arr[dragIndex].color
            if (!isPieceOnSquare(move.x, move.y, board)) validMoves.push(move)
            else if (isPieceOnSquare(move.x, move.y, board) && !sameColors) validMoves.push(move)
        }
    }
    return validMoves
}