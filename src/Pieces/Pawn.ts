import {
    getIndexAtPosition, isPieceOnSquare, getCurrPos,
    canvasSize, squareSize, imageSize, shiftImage, images
} from "../Utils/utils"
import {ColorPiece, PieceType, Positions} from "../Utils/types";

export const leftMostWhitePawnIndex = 2
export const leftMostBlackPawnIndex = 1
export let promotedPawnIndex = -1
export let promoteScreenOn = false
export let promotedPawns: Set<number> = new Set()

export function pawnPossibleMoves(
    currX: number, currY: number, index: number, board: Positions[], color_name_arr: ColorPiece[]
) {
    const white = color_name_arr[index].color === "white"
    const validMoves = []

    const topLeft = {
        x: currX - squareSize,
        y: white ? currY - squareSize : currY + squareSize,
        index: white ? getIndexAtPosition(currX-squareSize, currY-squareSize, board) :
            getIndexAtPosition(currX-squareSize, currY+squareSize,board)
    }
    const topRight = {
        x: currX + squareSize,
        y: white ? currY - squareSize : currY + squareSize,
        index: white ? getIndexAtPosition(currX+squareSize, currY-squareSize, board) :
            getIndexAtPosition(currX+squareSize, currY+squareSize,board)
    }
    const inFront = {
        x: currX,
        y: white ? currY - squareSize : currY + squareSize,
        index: white ? getIndexAtPosition(currX, currY-squareSize, board) :
            getIndexAtPosition(currX, currY+squareSize,board)
    }

    if (isPieceOnSquare(topLeft.x, topLeft.y, board) && color_name_arr[topLeft.index] &&
        color_name_arr[topLeft.index].color !== color_name_arr[index].color){
        validMoves.push(topLeft)
    }
    if (isPieceOnSquare(topRight.x, topRight.y, board) && color_name_arr[topRight.index] &&
        color_name_arr[topRight.index].color !== color_name_arr[index].color){
        validMoves.push(topRight)
    }
    if (!isPieceOnSquare(inFront.x, inFront.y, board)) validMoves.push(inFront)

    //Two squares in front
    if (white && currY >= canvasSize - 2 * squareSize && !isPieceOnSquare(inFront.x, inFront.y, board)
        && !isPieceOnSquare(inFront.x, inFront.y - squareSize, board)){
        validMoves.push({x: currX, y: currY-2*squareSize, index: getIndexAtPosition(currX, currY-2*squareSize,board)})
    }
    else if (!white && currY <= 2 * squareSize && !isPieceOnSquare(inFront.x, inFront.y, board)
        && !isPieceOnSquare(inFront.x, inFront.y + squareSize, board)){
        validMoves.push({x: currX, y: currY+2*squareSize, index: getIndexAtPosition(currX, currY+2*squareSize,board)})
    }
    return validMoves
}

function getCurrentPositionsForAllPawns(board: Positions[], pieceColors: ColorPiece[]){
    let blackPositions: Positions[] = []
    let whitePositions: Positions[] = []

    let whiteIndex = leftMostWhitePawnIndex
    let blackIndex = leftMostBlackPawnIndex
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

function drawPawnPromotionScreen(
    board: Positions[], piecesArr: any[], ctx: CanvasRenderingContext2D, moveY: number, moveX: number
) {
    const x = 225
    const y = 150
    promoteScreenOn = true
    promotedPawnIndex = getIndexAtPosition(moveX, moveY, board)
    promotedPawns.add(promotedPawnIndex)
    ctx.fillStyle = "#0d96be"
    ctx.fillRect(x, y, squareSize, 4 * squareSize);
    for (let dy = y + shiftImage, i = 0; i < piecesArr.length; i++, dy += 75) {
        const image = new Image();
        image.src = piecesArr[i];
        ctx.drawImage(image, x + shiftImage, dy, imageSize, imageSize);
    }
}

export function pawnPromotionScreen(board: Positions[], ctx: CanvasRenderingContext2D, pieceColors: ColorPiece[]) {
    const whitePieces = [images.white_queen, images.white_rook, images.white_bishop, images.white_knight]
    for (let move of getCurrentPositionsForAllPawns(board, pieceColors).whitePositions){
        if (move.y <= squareSize && move.y >= 0)
            drawPawnPromotionScreen(board, whitePieces, ctx, move.y, move.x)
    }
    const blackPieces = [images.black_queen, images.black_rook, images.black_bishop, images.black_knight]
    for (let move of getCurrentPositionsForAllPawns(board, pieceColors).blackPositions){
        if (move.y <= canvasSize && move.y >= canvasSize - squareSize)
            drawPawnPromotionScreen(board, blackPieces, ctx, move.y, move.x)
    }
}

export function promotePawn(
    mousePos: Positions, pieceColors: ColorPiece[], pieces: PieceType[], pieceImages: HTMLImageElement[]
) {
    let {x, y} = mousePos
    if (pieceColors[promotedPawnIndex]?.name === "pawn") {
        if (x >= 225 && x <= 300 && y >= 150 && y <= 225) {
            if (pieceColors[promotedPawnIndex].color === "white")
                promotePawnTo(images.white_queen, "queen", pieces, pieceColors, pieceImages)
            else promotePawnTo(images.black_queen, "queen", pieces, pieceColors, pieceImages)
        }
        else if (x >= 225 && x <= 300 && y >= 225 && y <= 300) {
            if (pieceColors[promotedPawnIndex].color === "white")
                promotePawnTo(images.white_rook, "rook", pieces, pieceColors, pieceImages)
            else promotePawnTo(images.black_rook, "rook", pieces, pieceColors, pieceImages)
        }
        else if (x >= 225 && x <= 300 && y >= 300 && y <= 375) {
            if (pieceColors[promotedPawnIndex].color === "white")
                promotePawnTo(images.white_bishop, "bishop", pieces, pieceColors, pieceImages)
            else promotePawnTo(images.black_bishop, "bishop", pieces, pieceColors, pieceImages)
        }
        else if (x >= 225 && x <= 300 && y >= 375 && y <= 450) {
            if (pieceColors[promotedPawnIndex].color === "white")
                promotePawnTo(images.white_knight, "knight", pieces, pieceColors, pieceImages)
            else promotePawnTo(images.black_knight, "knight", pieces, pieceColors, pieceImages)
        }
    }
}

function promotePawnTo (
    src: string, name: string, pieces: PieceType[], pieceColors: ColorPiece[], pieceImages: HTMLImageElement[]
){
    pieces[promotedPawnIndex].src = src
    pieces[promotedPawnIndex].name = name
    pieceImages[promotedPawnIndex].src = src
    pieceColors[promotedPawnIndex].name = name
    promoteScreenOn = false
}
