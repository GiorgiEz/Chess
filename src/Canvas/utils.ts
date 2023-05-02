import {ColorPiece, Positions, AlivePiece, PieceType} from "../types";

import {allPossibleMoves} from "../Pieces/AllMoves";
import {Canvas} from "./Canvas";
import {King} from "../Pieces/King";
import {Pawn} from "../Pieces/Pawn";
import {canvasWidth, imageSize, shiftImage, sounds, squareSize} from "../exports";

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
    for (let square = 0; square !== canvasWidth-squareSize; square += squareSize) {
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

export function includes(positionsArray: Positions[], allPositionsArray: Positions[]){
    for (let move of positionsArray){
        for (let posMoves of allPositionsArray){
            if (move.x === posMoves.x && move.y === posMoves.y) {return true}
        }
    }
    return false
}

function areOnlyKingsAlive(positions: AlivePiece[], pieceColors: ColorPiece[]){
    for (let i = 0; i < pieceColors.length; i++){
        if (pieceColors[i].name !== "king" && positions[i].isAlive) return false
    }
    return true
}

export function checkmateOrStalemate(board: AlivePiece[], pieceColors: ColorPiece[]){
    const whiteMoves = allPossibleMoves(board, pieceColors, []).whiteValidMoves
    const blackMoves = allPossibleMoves(board, pieceColors, []).blackValidMoves

    const whiteKingUnderAttack = blackMoves.filter(move => move.index === King.white_king.index)
    const blackKingUnderAttack = whiteMoves.filter(move => move.index === King.black_king.index)

    if (!whiteMoves.length && whiteKingUnderAttack.length && !Canvas.blackWon) {
        sounds.checkmate_sound.play()
        Canvas.blackWon = true
    }
    if (!blackMoves.length && blackKingUnderAttack.length && !Canvas.whiteWon) {
        sounds.checkmate_sound.play()
        Canvas.whiteWon = true
    }
    if (!whiteMoves.length && !whiteKingUnderAttack.length && !Canvas.staleMate) {
        sounds.stalemate_sound.play()
        Canvas.staleMate = true
    }
    if (!blackMoves.length && !blackKingUnderAttack.length && !Canvas.staleMate) {
        sounds.stalemate_sound.play()
        Canvas.staleMate = true
    }
    if (areOnlyKingsAlive(board, pieceColors) && !Canvas.staleMate) {
        sounds.stalemate_sound.play()
        Canvas.staleMate = true
    }
}

export function promotePawnTo(src: string, name: string, pieces: PieceType[], pieceColors: ColorPiece[], pieceImages: HTMLImageElement[]) {
    pieces[Pawn.promotedPawnIndex].src = src
    pieces[Pawn.promotedPawnIndex].name = name
    pieceImages[Pawn.promotedPawnIndex].src = src
    pieceColors[Pawn.promotedPawnIndex].name = name
    Pawn.promoteScreenOn = false
    Pawn.promotedPawnIndex = -1
}

export function addScore(killedPieceIndex: number, pieceColors: ColorPiece[]){
    let pieceScore = 0
    switch (pieceColors[killedPieceIndex].name){
        case "pawn":
            pieceScore += 1
            break
        case "knight":
            pieceScore += 3
            break
        case "bishop":
            pieceScore += 3
            break
        case "rook":
            pieceScore += 5
            break
        case "queen":
            pieceScore += 9
            break
    }
    return pieceScore
}
