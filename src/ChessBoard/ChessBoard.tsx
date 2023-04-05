import React from 'react';

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
import {MovePieces} from "./MovePieces";

interface Piece {
    src: string,
    x: number,
    y:number,
    color: "white" | "black",
    name: string
}

export const ChessBoard = () => {
    const canvasSize = 600
    const squareSize = 75
    const imageSize = 50
    const pieces: Piece[] = []

    const blackPieces = [blackRook, blackKnight, blackBishop, blackQueen, blackKing, blackBishop, blackKnight, blackRook]
    const whitePieces = [whiteRook, whiteKnight, whiteBishop, whiteQueen, whiteKing, whiteBishop, whiteKnight, whiteRook]
    const namesArray = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

    for (let i = 12.5, index = 0; index < blackPieces.length; i += squareSize, index++) {
        pieces.push({src: blackPieces[index], x: i, y: 12.5, color: "black", name: namesArray[index]})
        pieces.push({src: whitePieces[index], x: i, y: 537.5, color: "white", name: namesArray[index]})
        pieces.push({src: blackPawn, x: i, y: 87.5, color: "black", name:"pawn"})
        pieces.push({src: whitePawn, x: i, y: 462.5, color: "white", name:"pawn"})
    }

    return (
        <div>
            <MovePieces
                pieces={pieces}
                canvasSize={canvasSize}
                squareSize={squareSize}
                imageSize={imageSize}
            />
        </div>
    )
}