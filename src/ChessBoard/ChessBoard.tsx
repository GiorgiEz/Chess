import React from 'react';
import {MovePieces} from "./MovePieces"

import whitePawn from '../assets/white-pawn.png';
import whiteRook from '../assets/white-rook.png';
import whiteQueen from '../assets/white-queen.png';
import whiteKnight from '../assets/white-knight.png';
import whiteKing from '../assets/white-king.png';
import whiteBishop from '../assets/white-bishop.png';
import blackPawn from '../assets/black-pawn.png';
import blackRook from '../assets/black-rook.png';
import blackQueen from '../assets/black-queen.png';
import blackKnight from '../assets/black-knight.png';
import blackKing from '../assets/black-king.png';
import blackBishop from '../assets/black-bishop.png';

type Piece = {
    src: string,
    x: number,
    y:number,
    color: "white" | "black",
    name: string
}

export const ChessBoard = () => {
    const pieces: Piece[] = []

    const blackPieces = [blackRook, blackKnight, blackBishop, blackQueen, blackKing, blackBishop, blackKnight, blackRook]
    const whitePieces = [whiteRook, whiteKnight, whiteBishop, whiteQueen, whiteKing, whiteBishop, whiteKnight, whiteRook]
    const namesArray = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

    for (let pos = 12.5, index = 0; index < blackPieces.length; pos += 75, index++) {
        pieces.push({src: blackPieces[index], x: pos, y: 12.5, color: "black", name: namesArray[index]})
        pieces.push({src: blackPawn, x: pos, y: 87.5, color: "black", name:"pawn"})
        pieces.push({src: whitePawn, x: pos, y: 462.5, color: "white", name:"pawn"})
        pieces.push({src: whitePieces[index], x: pos, y: 537.5, color: "white", name: namesArray[index]})
    }

    return (
        <MovePieces pieces={pieces}/>
    )
}
