import React, {useRef, useEffect} from 'react';
import './ChessBoard.css';
import {MoveImages} from "./MovePeaces"

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

interface Props {
    src: string, x: number, y: number;
}

export const ChessBoard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const squareSize = 75

    const pieces: Props[] = [
        {src: blackRook, x:12.5, y:12.5},
        {src: blackKnight, x:87.5, y:12.5},
        {src: blackBishop, x:162.5, y:12.5},
        {src: blackQueen, x:237.5, y:12.5},
        {src: blackKing, x:312.5, y:12.5},
        {src: blackBishop, x:387.5, y:12.5},
        {src: blackKnight, x:462.5, y:12.5},
        {src: blackRook, x:537.5, y:12.5},

        {src: whiteRook, x:12.5, y:537.5},
        {src: whiteKnight, x:87.5, y:537.5},
        {src: whiteBishop, x:162.5, y:537.5},
        {src: whiteQueen, x:237.5, y:537.5},
        {src: whiteKing, x:312.5, y:537.5},
        {src: whiteBishop, x:387.5, y:537.5},
        {src: whiteKnight, x:462.5, y:537.5},
        {src: whiteRook, x:537.5, y:537.5},
        ]

    for (let i = 12.5; i < 600; i += squareSize){
        pieces.push({src: blackPawn, x: i, y:87.5})
        pieces.push({src: whitePawn, x: i, y:462.5})
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, 500, 500);
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const x = col * squareSize;
                    const y = row * squareSize;
                    ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
                    ctx.fillRect(x, y, squareSize, squareSize);
                }
            }
        }
    }, []);

    return (
        <div>
            <canvas
                className={"chessboard"}
                ref={canvasRef}
                width={600}
                height={600}
            />
            <MoveImages pieces={pieces} />
        </div>
    );
};