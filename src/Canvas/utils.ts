import {Moves, ColorPiece, Positions, AllMovesFunction, ValidMovesFunction} from "./types";

import whitePawn from '../assets/white-pawn.png';
import whiteRook from '../assets/white-rook.png';
import whiteQueen from '../assets/white-queen.png';
import whiteKnight from '../assets/white-knight.png';
import whiteKing from '../assets/white-king.png';
import whiteBishop from '../assets/white-bishop.png';
import blackPawn from '../assets/black-pawn.png';
import blackRook from '../assets/black-rook.png';
import blackQueen from '../assets/black-queen.png';
import blackKnight from '../assets/black-knight.png';
import blackKing from '../assets/black-king.png';
import blackBishop from '../assets/black-bishop.png';

export const images = {
    white_pawn: whitePawn,
    white_rook: whiteRook,
    white_queen: whiteQueen,
    white_knight: whiteKnight,
    white_king: whiteKing,
    white_bishop: whiteBishop,
    black_pawn: blackPawn,
    black_rook: blackRook,
    black_queen: blackQueen,
    black_knight: blackKnight,
    black_king: blackKing,
    black_bishop: blackBishop,
}

export const squareSize = 75;
export const canvasSize = 600;
export const imageSize = 50;
export const shiftImage = 12.5;

export function getCurrPos(draggingIndex: number, positions: Positions[]) {
    let currX = 0
    let currY = 0
    if (draggingIndex !== -1) {
        currX = positions[draggingIndex].x;
        currY = positions[draggingIndex].y;
        return {currX, currY}
    }
    return {currX, currY}
}

export function adjustPiecePositions(mousePosition: Positions) {
    let {x, y} = mousePosition
    let nextSquare = squareSize;
    for (let square = 0; square !== canvasSize; square += squareSize) {
        if (x >= square && x <= nextSquare) x = square + shiftImage;
        if (y < nextSquare && y >= square) y = square + shiftImage;
        nextSquare += squareSize;
    }
    return {x, y}
}

export function getIndexAtPosition(x: number, y: number, board: Positions[]) {
    for (let i = 0; i < board.length; i++) {
        const { x: imageX, y: imageY } = board[i];
        if (x >= imageX && x <= imageX + imageSize && y >= imageY && y <= imageY + imageSize) return i;
    }
    return -1;
}

export function isPieceOnSquare(x: number, y: number, board: Positions[]) {
    return board.some(pos => pos.x === x && pos.y === y);
}

export function hasMoved(board: Positions[], index: number, initialPos: Positions){
    return board[index].x === initialPos.x && board[index].y === initialPos.y
}

export function includes(positionsArray: Positions[], allPositionsArray: Positions[]){
    for (let move of positionsArray){
        for (let posMoves of allPositionsArray){
            if (move.x === posMoves.x && move.y === posMoves.y) {return true}
        }
    }
    return false
}

// check if position where the king or the knight can move isn't blocked by same colored piece
export function availableMoves(moves: Moves[], board: Positions[], dragIndex: number, color_name_arr: ColorPiece[]) {
    let validMoves: Moves[] = []
    for (let i = 0; i < moves.length; i++){
        const move = {x: moves[i].x, y: moves[i].y, index: moves[i].index}
        if (move.x >= 0 && move.x <= canvasSize && move.y >= 0 && move.y <= canvasSize) {
            const sameColors = color_name_arr[move.index]?.color === color_name_arr[dragIndex].color
            if (!isPieceOnSquare(move.x, move.y, board)) validMoves.push(move)
            else if (isPieceOnSquare(move.x, move.y, board) && !sameColors) validMoves.push(move)
        }
    }
    return validMoves
}

export function getValidMovesForRookOrBishop (
    dx: number, dy: number, currX: number, currY: number, dragIndex: number, board: Positions[], color_name_arr: ColorPiece[]
) {
    let validMoves: Moves[] = [];
    for (let square = squareSize; square < canvasSize; square += squareSize) {
        const x = currX + square * dx;
        const y = currY + square * dy;
        const index = getIndexAtPosition(x, y, board);

        if (x >= 0 && x <= canvasSize && y >= 0 && y <= canvasSize) {
            const sameColors = color_name_arr[index]?.color === color_name_arr[dragIndex]?.color;
            if (isPieceOnSquare(x, y, board) && sameColors) break;
            else if (isPieceOnSquare(x, y, board) && !sameColors) {validMoves.push({x, y, index});break;}
            validMoves.push({x, y, index});
        }
    }
    return validMoves;
}

export function movementHandler(
    king: Positions, draggingIndex: number, positions: Positions[], pieceColors: ColorPiece[], redSquares: Positions[],
    allMovesFunction: AllMovesFunction, validMovesFunction: ValidMovesFunction
) {
    const {currX, currY} = getCurrPos(draggingIndex, positions)
    const index = getIndexAtPosition(currX, currY, positions)
    const updatedValidMoves = []
    for (let move of validMovesFunction(currX, currY, index, positions, pieceColors)) {
        const newBoard = positions.map(pos => ({...pos}));

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
