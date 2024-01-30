import {ColorPiece, Positions, PieceType} from "./types";
import {Pawn} from "./Pieces/Pawn";
import {canvasSize, imageSize, pieceImages, Pieces, shiftImage, squareSize} from "./exports";

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
    for (let square = 0; square !== canvasSize; square += squareSize) {
        if (x >= square && x <= nextSquare) x = square + shiftImage;
        if (y < nextSquare && y >= square) y = square + shiftImage;
        nextSquare += squareSize;
    }
    return {x, y}
}

export function getIndexAtPosition(x: number, y: number, board: Positions[]) {
    for (let i = 0; i < board.length; i++) {
        const { x: imageX, y: imageY } = board[i];
        if (x >= imageX && x <= imageX + imageSize && y >= imageY && y <= imageY + imageSize) {
            return i;
        }
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

export function areOnlyKingsAlive(board: PieceType[]){
    for (let i = 0; i < board.length; i++){
        if (board[i].name !== Pieces.KING && board[i].x !== -1000) return false
    }
    return true
}

export function promotePawnTo(src: string, name: string, board: PieceType[]) {
    board[Pawn.promotedPawnIndex].image = createImage(src)
    board[Pawn.promotedPawnIndex].name = name
    board[Pawn.promotedPawnIndex].name = name
    Pawn.promoteScreenOn = false
    Pawn.promotedPawnIndex = -1
}

export function createImage(src: string){
    const image = new Image()
    image.src = src
    return image
}

export function setupChessBoard(){
    const pieces: PieceType[] = []

    const blackPieces = [
        pieceImages.black_rook, pieceImages.black_knight, pieceImages.black_bishop, pieceImages.black_queen,
        pieceImages.black_king, pieceImages.black_bishop, pieceImages.black_knight, pieceImages.black_rook
    ]
    const whitePieces = [
        pieceImages.white_rook, pieceImages.white_knight, pieceImages.white_bishop, pieceImages.white_queen,
        pieceImages.white_king, pieceImages.white_bishop, pieceImages.white_knight, pieceImages.white_rook
    ]
    const namesArray = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

    for (let pos = shiftImage, i = 0; i < blackPieces.length; pos += squareSize, i++) {
        pieces.push({image: createImage(blackPieces[i]), x: pos, y: 12.5, color: "black", name: namesArray[i]})
        pieces.push({image: createImage(pieceImages.black_pawn), x: pos, y: 87.5, color: "black", name:"pawn"})
        pieces.push({image: createImage(pieceImages.white_pawn), x: pos, y: 462.5, color: "white", name:"pawn"})
        pieces.push({image: createImage(whitePieces[i]), x: pos, y: 537.5, color: "white", name: namesArray[i]})
    }
    return pieces
}
