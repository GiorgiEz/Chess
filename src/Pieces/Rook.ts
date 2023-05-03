import {Moves, ColorPiece, Positions} from "../types";
import {King} from "./King";
import {getValidMovesForRookOrBishop} from "./Movements";
import {canvasWidth, shiftImage, sounds, squareSize} from "../exports";

export class Rook{
    Indexes = [3, 31, 0, 28]

    static leftWhiteRook = {index: 3, hasMoved: false}
    static rightWhiteRook = {index: 31, hasMoved: false}
    static leftBlackRook = {index: 0, hasMoved: false}
    static rightBlackRook = {index: 28, hasMoved: false}

    validMoves(x: number, y: number, index: number, board: Positions[], pieceColors: ColorPiece[]): Moves[] {
        return getValidMovesForRookOrBishop(-1, 0, x, y, index, board, pieceColors)
            .concat(getValidMovesForRookOrBishop(1, 0, x, y, index, board, pieceColors))
            .concat(getValidMovesForRookOrBishop(0, -1, x, y, index, board, pieceColors))
            .concat(getValidMovesForRookOrBishop(0, 1, x, y, index, board, pieceColors))
    }

    //Move rook if king moves to castling position and set king.hasMoved to true
    static castleRook(board: Positions[], pieceColors: ColorPiece[], draggingIndex: number, x: number){
        const kingCastlePosRight = canvasWidth/2 + 2*squareSize + shiftImage
        const kingCastlePosLeft = 3*squareSize + shiftImage
        if (pieceColors[draggingIndex].color === "white" && !King.white_king.hasMoved) {
            if (x === kingCastlePosRight || x === kingCastlePosLeft) sounds.castle_sound.play()
            if (x === kingCastlePosRight) board[Rook.rightWhiteRook.index].x = canvasWidth/2 + squareSize + shiftImage
            if (x === kingCastlePosLeft) board[Rook.leftWhiteRook.index].x = canvasWidth/2 - squareSize + shiftImage
            King.white_king.hasMoved = true
        }
        if (pieceColors[draggingIndex].color === "black" && !King.black_king.hasMoved){
            if (x === kingCastlePosRight || x === kingCastlePosLeft) sounds.castle_sound.play()
            if (x === kingCastlePosRight) board[Rook.rightBlackRook.index].x = 462.5
            if (x === kingCastlePosLeft) board[Rook.leftBlackRook.index].x = 312.5
            King.black_king.hasMoved = true
        }
    }

    static hasMoved(pieceColors: ColorPiece[], draggingIndex: number){
        if (pieceColors[draggingIndex].color === "white"){
            if (draggingIndex === Rook.leftWhiteRook.index) Rook.leftWhiteRook.hasMoved = true
            if (draggingIndex === Rook.rightWhiteRook.index) Rook.rightWhiteRook.hasMoved = true
        }
        else {
            if (draggingIndex === Rook.leftBlackRook.index) Rook.leftBlackRook.hasMoved = true
            if (draggingIndex === Rook.rightBlackRook.index) Rook.rightBlackRook.hasMoved = true
        }
    }
}
