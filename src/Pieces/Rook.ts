import {Moves, ColorPiece, Positions, PieceType} from "../types";
import {King} from "./King";
import {getValidMovesForRookOrBishop} from "./moves/Movements";
import {canvasSize, shiftImage, sounds, squareSize} from "../exports";

export class Rook{
    Indexes = [3, 31, 0, 28]

    static leftWhiteRook = {index: 3, hasMoved: false}
    static rightWhiteRook = {index: 31, hasMoved: false}
    static leftBlackRook = {index: 0, hasMoved: false}
    static rightBlackRook = {index: 28, hasMoved: false}

    validMoves(x: number, y: number, index: number, board: PieceType[]): Moves[] {
        return getValidMovesForRookOrBishop(-1, 0, x, y, index, board,)
            .concat(getValidMovesForRookOrBishop(1, 0, x, y, index, board))
            .concat(getValidMovesForRookOrBishop(0, -1, x, y, index, board))
            .concat(getValidMovesForRookOrBishop(0, 1, x, y, index, board))
    }

    //Move rook if king moves to castling position
    static castleRook(board: PieceType[], draggingIndex: number, x: number){
        const kingCastlePosRight = canvasSize/2 + 2*squareSize + shiftImage
        const kingCastlePosLeft = 3*squareSize + shiftImage
        if (board[draggingIndex].color === "white" && !King.white_king.hasMoved) {
            if (x === kingCastlePosRight || x === kingCastlePosLeft){
                sounds.castle_sound.play()
            }
            if (x === kingCastlePosRight) {
                board[Rook.rightWhiteRook.index].x = canvasSize/2 + shiftImage
            }
            if (x === kingCastlePosLeft) {
                board[Rook.leftWhiteRook.index].x = canvasSize/2 + shiftImage
            }
            King.white_king.hasMoved = true
        }
        if (board[draggingIndex].color === "black" && !King.black_king.hasMoved){
            if (x === kingCastlePosRight || x === kingCastlePosLeft) {
                sounds.castle_sound.play()
            }
            if (x === kingCastlePosRight) {
                board[Rook.rightBlackRook.index].x = 462.5
            }
            if (x === kingCastlePosLeft) {
                board[Rook.leftBlackRook.index].x = 312.5
            }
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
