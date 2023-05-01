import {PieceType} from "../Canvas/types";
import {MovePieces} from "./MovePieces"
import {images} from "../Canvas/utils";

const pieces: PieceType[] = []
export const initialBoard: PieceType[] = []

const blackPieces = [
    images.black_rook, images.black_knight, images.black_bishop, images.black_queen,
    images.black_king, images.black_bishop, images.black_knight, images.black_rook
]
const whitePieces = [
    images.white_rook, images.white_knight, images.white_bishop, images.white_queen,
    images.white_king, images.white_bishop, images.white_knight, images.white_rook
]
const namesArray = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

for (let pos = 12.5, i = 0; i < blackPieces.length; pos += 75, i++) {
    pieces.push({src: blackPieces[i], x: pos, y: 12.5, color: "black", name: namesArray[i], isAlive: true})
    pieces.push({src: images.black_pawn, x: pos, y: 87.5, color: "black", name:"pawn", isAlive: true})
    pieces.push({src: images.white_pawn, x: pos, y: 462.5, color: "white", name:"pawn", isAlive: true})
    pieces.push({src: whitePieces[i], x: pos, y: 537.5, color: "white", name: namesArray[i], isAlive: true})

    initialBoard.push({src: blackPieces[i], x: pos, y: 12.5, color: "black", name: namesArray[i], isAlive: true})
    initialBoard.push({src: images.black_pawn, x: pos, y: 87.5, color: "black", name:"pawn", isAlive: true})
    initialBoard.push({src: images.white_pawn, x: pos, y: 462.5, color: "white", name:"pawn", isAlive: true})
    initialBoard.push({src: whitePieces[i], x: pos, y: 537.5, color: "white", name: namesArray[i], isAlive: true})
}

export const ChessBoard = () => {
    return <MovePieces pieces={pieces}/>
}
