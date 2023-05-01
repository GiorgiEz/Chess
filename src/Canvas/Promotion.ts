import {ColorPiece, PieceType, Positions} from "./types";
import {Pawn} from "../Pieces/Pawn";
import {canvasSize, images, squareSize} from "./utils";

export function promotePawn(mousePos: Positions, pieceColors: ColorPiece[], pieces: PieceType[], pieceImages: HTMLImageElement[]) {
    let {x, y} = mousePos
    if (pieceColors[Pawn.promotedPawnIndex]?.name === "pawn") {
        if (x >= 0 && x <= 2*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
            if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                promotePawnTo(images.white_queen, "queen", pieces, pieceColors, pieceImages)
            else promotePawnTo(images.black_queen, "queen", pieces, pieceColors, pieceImages)
        } if (x >= 2*squareSize && x <= canvasSize/2 && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
            if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                promotePawnTo(images.white_rook, "rook", pieces, pieceColors, pieceImages)
            else promotePawnTo(images.black_rook, "rook", pieces, pieceColors, pieceImages)
        } if (x >= canvasSize/2 && x <= canvasSize-2*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
            if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                promotePawnTo(images.white_bishop, "bishop", pieces, pieceColors, pieceImages)
            else promotePawnTo(images.black_bishop, "bishop", pieces, pieceColors, pieceImages)
        } if (x >= canvasSize-2*squareSize && x <= canvasSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
            if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                promotePawnTo(images.white_knight, "knight", pieces, pieceColors, pieceImages)
            else promotePawnTo(images.black_knight, "knight", pieces, pieceColors, pieceImages)
        }
    }
}

function promotePawnTo(src: string, name: string, pieces: PieceType[], pieceColors: ColorPiece[], pieceImages: HTMLImageElement[]) {
    pieces[Pawn.promotedPawnIndex].src = src
    pieces[Pawn.promotedPawnIndex].name = name
    pieceImages[Pawn.promotedPawnIndex].src = src
    pieceColors[Pawn.promotedPawnIndex].name = name
    Pawn.promoteScreenOn = false
    Pawn.promotedPawnIndex = -1
}
