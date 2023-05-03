import {AlivePiece, ColorPiece, Moves, PieceType, Positions} from "../types";
import {getIndexAtPosition, isPieceOnSquare,} from "../Canvas/utils"
import {Canvas} from "../Canvas/Canvas";
import {boardSize, canvasWidth, sounds, squareSize} from "../exports";

export class Pawn {
    static promotedPawnIndex = -1
    static lastMovedPawnIndex = -1
    static promoteScreenOn = false
    static promotedPawns: Set<number> = new Set()

    validMoves(x: number, y: number, index: number, board: Positions[], pieceColors: ColorPiece[]): Moves[] {
        const white = pieceColors[index].color === "white"
        const validMoves = []

        const topLeft = {
            x: x - squareSize,
            y: white ? y - squareSize : y + squareSize,
            index: white ? getIndexAtPosition(x - squareSize, y - squareSize, board) :
                getIndexAtPosition(x - squareSize, y + squareSize, board)
        }
        const topRight = {
            x: x + squareSize,
            y: white ? y - squareSize : y + squareSize,
            index: white ? getIndexAtPosition(x + squareSize, y - squareSize, board) :
                getIndexAtPosition(x + squareSize, y + squareSize, board)
        }
        const inFront = {
            x: x,
            y: white ? y - squareSize : y + squareSize,
            index: white ? getIndexAtPosition(x, y - squareSize, board) :
                getIndexAtPosition(x, y + squareSize, board)
        }

        //Check for En Passant moves
        if (Pawn.lastMovedPawnIndex !== -1 && getIndexAtPosition(x-squareSize, y, board) === Pawn.lastMovedPawnIndex){
            validMoves.push(topLeft)
        }

        if (Pawn.lastMovedPawnIndex !== -1 && getIndexAtPosition(x+squareSize, y, board) === Pawn.lastMovedPawnIndex){
            validMoves.push(topRight)
        }

        if (x >= squareSize && x <= canvasWidth-squareSize && y >= 0 && y <= boardSize) {
            if (isPieceOnSquare(topLeft.x, topLeft.y, board) && pieceColors[topLeft.index] &&
                pieceColors[topLeft.index].color !== pieceColors[index].color) {
                validMoves.push(topLeft)
            }
            if (isPieceOnSquare(topRight.x, topRight.y, board) && pieceColors[topRight.index] &&
                pieceColors[topRight.index].color !== pieceColors[index].color) {
                validMoves.push(topRight)
            }
            if (!isPieceOnSquare(inFront.x, inFront.y, board)) validMoves.push(inFront)

            //Two squares in front
            if (white && y >= boardSize - 2 * squareSize){
                if(!isPieceOnSquare(inFront.x, inFront.y, board) && !isPieceOnSquare(inFront.x, inFront.y - squareSize, board))
                validMoves.push({
                    x: x,
                    y: y - 2 * squareSize,
                    index: getIndexAtPosition(x, y - 2 * squareSize, board)
                })

            } else if (!white && y <= 2 * squareSize && !isPieceOnSquare(inFront.x, inFront.y, board)
                && !isPieceOnSquare(inFront.x, inFront.y + squareSize, board)) {
                validMoves.push({
                    x: x,
                    y: y + 2 * squareSize,
                    index: getIndexAtPosition(x, y + 2 * squareSize, board)
                })
            }
        }
        return validMoves
    }

    static setLastMovedPawnIndex(pieceColors: ColorPiece[], draggingIndex: number, board: Positions[], y: number){
        if (pieceColors[draggingIndex].color === "white"){
            if (board[draggingIndex].y - y === 2*squareSize) Pawn.lastMovedPawnIndex = draggingIndex
            else Pawn.lastMovedPawnIndex = -1
        }
        else {
            if (y - board[draggingIndex].y === 2*squareSize) Pawn.lastMovedPawnIndex = draggingIndex
            else Pawn.lastMovedPawnIndex = -1
        }
    }

    static enPassantMove(enPassantPos: Positions, board: AlivePiece[],
                         pieceColors: ColorPiece[], draggingIndex: number, pieces: PieceType[]){
        if (pieceColors[draggingIndex].name === "pawn"){
            const white = pieceColors[draggingIndex].color === "white"
            const topLeft = {
                x: board[draggingIndex].x - squareSize,
                y: white ? board[draggingIndex].y - squareSize : board[draggingIndex].y + squareSize,
                index: white ? getIndexAtPosition(board[draggingIndex].x - squareSize, board[draggingIndex].y - squareSize, board) :
                    getIndexAtPosition(board[draggingIndex].x - squareSize, board[draggingIndex].y + squareSize, board)
            }
            const topRight = {
                x: board[draggingIndex].x + squareSize,
                y: white ? board[draggingIndex].y - squareSize : board[draggingIndex].y + squareSize,
                index: white ? getIndexAtPosition(board[draggingIndex].x + squareSize, board[draggingIndex].y - squareSize, board) :
                    getIndexAtPosition(board[draggingIndex].x + squareSize, board[draggingIndex].y + squareSize, board)
            }

            const killedPieceIndex = white ? getIndexAtPosition(enPassantPos.x, enPassantPos.y+squareSize, board)
                : getIndexAtPosition(enPassantPos.x, enPassantPos.y-squareSize, board)

            if (white) {
                if (!isPieceOnSquare(enPassantPos.x, enPassantPos.y, board) && (
                    (enPassantPos.x === topLeft.x && enPassantPos.y === topLeft.y) ||
                    (enPassantPos.x === topRight.x && enPassantPos.y === topLeft.y))){
                    board[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
                    Canvas.blackKilledPieces.push(pieces[killedPieceIndex])
                    Canvas.whiteScore += 1
                    sounds.capture_sound.play()
                }
            }
            else {
                if (!isPieceOnSquare(enPassantPos.x, enPassantPos.y, board) && (
                    (enPassantPos.x === topLeft.x && enPassantPos.y === topLeft.y) ||
                    (enPassantPos.x === topRight.x && enPassantPos.y === topLeft.y))){
                    board[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
                    Canvas.whiteKilledPieces.push(pieces[killedPieceIndex])
                    Canvas.blackScore += 1
                    sounds.capture_sound.play()
                }
            }
        }
    }
}
