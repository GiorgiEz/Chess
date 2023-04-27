import {
    getIndexAtPosition, isPieceOnSquare, getCurrPos,
    images, squareSize, canvasSize
} from "../Canvas/utils"
import {ColorPiece, Moves, PieceType, Positions} from "../Canvas/types";

export class Pawn {
    leftMostWhitePawnIndex = 2
    leftMostBlackPawnIndex = 1
    static promotedPawnIndex = -1
    static promoteScreenOn = false
    static promotedPawns: Set<number> = new Set()

    validMoves(currX: number, currY: number, index: number, board: Positions[], color_name_arr: ColorPiece[]): Moves[] {
        const white = color_name_arr[index].color === "white"
        const validMoves = []

        const topLeft = {
            x: currX - squareSize,
            y: white ? currY - squareSize : currY + squareSize,
            index: white ? getIndexAtPosition(currX - squareSize, currY - squareSize, board) :
                getIndexAtPosition(currX - squareSize, currY + squareSize, board)
        }
        const topRight = {
            x: currX + squareSize,
            y: white ? currY - squareSize : currY + squareSize,
            index: white ? getIndexAtPosition(currX + squareSize, currY - squareSize, board) :
                getIndexAtPosition(currX + squareSize, currY + squareSize, board)
        }
        const inFront = {
            x: currX,
            y: white ? currY - squareSize : currY + squareSize,
            index: white ? getIndexAtPosition(currX, currY - squareSize, board) :
                getIndexAtPosition(currX, currY + squareSize, board)
        }

        if (isPieceOnSquare(topLeft.x, topLeft.y, board) && color_name_arr[topLeft.index] &&
            color_name_arr[topLeft.index].color !== color_name_arr[index].color) {
            validMoves.push(topLeft)
        }
        if (isPieceOnSquare(topRight.x, topRight.y, board) && color_name_arr[topRight.index] &&
            color_name_arr[topRight.index].color !== color_name_arr[index].color) {
            validMoves.push(topRight)
        }
        if (!isPieceOnSquare(inFront.x, inFront.y, board)) validMoves.push(inFront)

        //Two squares in front
        if (white && currY >= canvasSize - 2 * squareSize && !isPieceOnSquare(inFront.x, inFront.y, board)
            && !isPieceOnSquare(inFront.x, inFront.y - squareSize, board)) {
            validMoves.push({
                x: currX,
                y: currY - 2 * squareSize,
                index: getIndexAtPosition(currX, currY - 2 * squareSize, board)
            })
        } else if (!white && currY <= 2 * squareSize && !isPieceOnSquare(inFront.x, inFront.y, board)
            && !isPieceOnSquare(inFront.x, inFront.y + squareSize, board)) {
            validMoves.push({
                x: currX,
                y: currY + 2 * squareSize,
                index: getIndexAtPosition(currX, currY + 2 * squareSize, board)
            })
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

    promotePawn(mousePos: Positions, pieceColors: ColorPiece[], pieces: PieceType[], pieceImages: HTMLImageElement[]) {
        let {x, y} = mousePos
        if (pieceColors[Pawn.promotedPawnIndex]?.name === "pawn") {
            if (x >= 0 && x <= 2*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                    this.promotePawnTo(images.white_queen, "queen", pieces, pieceColors, pieceImages)
                else this.promotePawnTo(images.black_queen, "queen", pieces, pieceColors, pieceImages)
            } if (x >= 2*squareSize && x <= canvasSize/2 && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                    this.promotePawnTo(images.white_rook, "rook", pieces, pieceColors, pieceImages)
                else this.promotePawnTo(images.black_rook, "rook", pieces, pieceColors, pieceImages)
            } if (x >= canvasSize/2 && x <= canvasSize-2*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                    this.promotePawnTo(images.white_bishop, "bishop", pieces, pieceColors, pieceImages)
                else this.promotePawnTo(images.black_bishop, "bishop", pieces, pieceColors, pieceImages)
            } if (x >= canvasSize-2*squareSize && x <= canvasSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                    this.promotePawnTo(images.white_knight, "knight", pieces, pieceColors, pieceImages)
                else this.promotePawnTo(images.black_knight, "knight", pieces, pieceColors, pieceImages)
            }
        }
    }

    promotePawnTo(src: string, name: string, pieces: PieceType[], pieceColors: ColorPiece[], pieceImages: HTMLImageElement[]) {
        pieces[Pawn.promotedPawnIndex].src = src
        pieces[Pawn.promotedPawnIndex].name = name
        pieceImages[Pawn.promotedPawnIndex].src = src
        pieceColors[Pawn.promotedPawnIndex].name = name
        Pawn.promoteScreenOn = false
    }
}
