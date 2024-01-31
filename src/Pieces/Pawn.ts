import {Moves, PieceType, Positions} from "../types";
import {getIndexAtPosition, isPieceOnSquare,} from "../utils"
import {canvasSize, Pieces, sounds, squareSize} from "../exports";

export class Pawn {
    static promotedPawnIndex = -1
    static lastMovedPawnIndex = -1
    static promoteScreenOn = false
    static promotedPawns: Set<number> = new Set()

    validMoves(x: number, y: number, index: number, board: PieceType[]): Moves[] {
        const white = board[index].color === "white"
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

        if (x >= 0 && x <= canvasSize && y >= 0 && y <= canvasSize) {
            if (isPieceOnSquare(topLeft.x, topLeft.y, board) && board[topLeft.index] &&
                board[topLeft.index].color !== board[index].color) {
                validMoves.push(topLeft)
            }
            if (isPieceOnSquare(topRight.x, topRight.y, board) && board[topRight.index] &&
                board[topRight.index].color !== board[index].color) {
                validMoves.push(topRight)
            }
            if (!isPieceOnSquare(inFront.x, inFront.y, board)) {
                validMoves.push(inFront)
            }

            //Two squares in front
            if (white && y >= canvasSize - 2 * squareSize){
                if(!isPieceOnSquare(inFront.x, inFront.y, board) && !isPieceOnSquare(inFront.x, inFront.y - squareSize, board)){
                    validMoves.push({
                        x: x,
                        y: y - 2 * squareSize,
                        index: getIndexAtPosition(x, y - 2 * squareSize, board)
                    })
                }
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

    killedPieces(enPassantPos: Positions, topLeft: Moves, topRight: Moves, board: PieceType[], killedPieceIndex: number){
        let teamKilledPieces: HTMLImageElement[] = []
        const isEnPassant = !isPieceOnSquare(enPassantPos.x, enPassantPos.y, board) && (
            (enPassantPos.x === topLeft.x && enPassantPos.y === topLeft.y) ||
            (enPassantPos.x === topRight.x && enPassantPos.y === topLeft.y))

        if (isEnPassant){
            board[killedPieceIndex] = {...board[killedPieceIndex], x: -1000, y: -1000}

            teamKilledPieces.push(board[killedPieceIndex].image)
            sounds.capture_sound.play()
        }
        return teamKilledPieces
    }

    enPassantMove(enPassantPos: Positions, board: PieceType[], draggingIndex: number){
        if (board[draggingIndex].name === Pieces.PAWN){
            const white = board[draggingIndex].color === "white"
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
                this.killedPieces(enPassantPos, topLeft, topRight, board, killedPieceIndex)
            }
            else {
                this.killedPieces(enPassantPos, topLeft, topRight, board, killedPieceIndex)
            }
        }
    }
}
