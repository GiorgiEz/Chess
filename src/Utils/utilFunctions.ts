import {Positions} from "./types";
import {Pieces} from "./exports";
import Game from "../Game/Game";

const game = Game.getInstance();

export function adjustPiecePositions(mousePos: Positions) {
    let {x, y} = mousePos
    let nextSquare = game.squareSize;
    for (let square = 0; square !== game.canvasSize; square += game.squareSize) {
        if (x >= square && x <= nextSquare){
            x = square + game.shiftImage;
        }
        if (y < nextSquare && y >= square){
            y = square + game.shiftImage;
        }
        nextSquare += game.squareSize;
    }
    return {x, y}
}

export function getPieceAtPosition(x: number, y: number, chessboard = game.chessboard) {
    for (let piece of chessboard) {
        const { x: imageX, y: imageY } = piece;
        if (x >= imageX && x <= imageX + game.imageSize && y >= imageY && y <= imageY + game.imageSize) {
            return piece
        }
    }
    return null;
}

export function isPieceOnSquare(x: number, y: number, chessboard: Positions[] = game.chessboard) {
    return chessboard.some((piece) => piece.x === x && piece.y === y);
}

export function comparePositions(pos1: Positions, pos2: Positions){
    return pos1.x === pos2.x && pos1.y === pos2.y
}

export function areOnlyKingsAlive(){
    for (let piece of game.chessboard) {
        if (piece.name !== Pieces.KING && piece.x > 0) {
            return false
        }
    }
    return true
}

export function promotePawnTo(src: string, name: string) {
    if (game.promotedPawn) {
        game.chessboard[game.promotedPawn.index] = {...game.promotedPawn!, image: createImage(src), name}
        game.isPromotionScreenOn = false
        game.promotedPawn = null
    }
}

export function createImage(src: string){
    const image = new Image()
    image.src = src
    return image
}
