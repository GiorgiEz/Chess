import {
    getIndexAtPosition, isPieceOnSquare, getCurrPos,
    canvasSize, squareSize
} from "../Canvas/utils"
import {ColorPiece, Moves, Positions} from "../Canvas/types";

export class Pawn {
    leftMostWhitePawnIndex = 2
    leftMostBlackPawnIndex = 1
    static promotedPawnIndex = -1
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

        // Check for En Passant moves
        // if (getIndexAtPosition(x-squareSize, y, board) === Canvas.lastMovedPawn){
        //     validMoves.push(topLeft)
        // }

        if (x >= 0 && x <= canvasSize && y >= 0 && y <= canvasSize) {
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
            if (white && y >= canvasSize - 2 * squareSize){
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

    getCurrentPositionsForAllPawns(board: Positions[], pieceColors: ColorPiece[]) {
        let blackPositions: Positions[] = []
        let whitePositions: Positions[] = []

        let whiteIndex = this.leftMostWhitePawnIndex
        let blackIndex = this.leftMostBlackPawnIndex
        while (whiteIndex < board.length) {
            let {currX: currXWhite, currY: currYWhite} = getCurrPos(whiteIndex, board)
            let {currX: currXBlack, currY: currYBlack} = getCurrPos(blackIndex, board)

            if (pieceColors[getIndexAtPosition(currXWhite, currYWhite, board)].name === "pawn")
                whitePositions.push({x: currXWhite, y: currYWhite})
            if (pieceColors[getIndexAtPosition(currXBlack, currYBlack, board)].name === "pawn")
                blackPositions.push({x: currXBlack, y: currYBlack})

            whiteIndex += 4 // next white pawn
            blackIndex += 4 // next white pawn
        }
        return {whitePositions, blackPositions}
    }
}
