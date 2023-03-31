import React, {useRef, useEffect} from 'react';
import './ChessBoard.css';
import {MoveImages} from "./MoveImage"

import whitePawn from './assets/white-pawn.png';
import whiteRook from './assets/white-rook.png';
import whiteQueen from './assets/white-queen.png';
import whiteKnight from './assets/white-knight.png';
import whiteKing from './assets/white-king.png';
import whiteBishop from './assets/white-bishop.png';
import blackPawn from './assets/black-pawn.png';
import blackRook from './assets/black-rook.png';
import blackQueen from './assets/black-queen.png';
import blackKnight from './assets/black-knight.png';
import blackKing from './assets/black-king.png';
import blackBishop from './assets/black-bishop.png';

interface Props {
    src: string, x: number, y: number;
}

export const ChessBoard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pieces: Props[] = [
        {src: blackRook, x:10, y:10},
        {src: blackKnight, x:72.5, y:10},
        {src: blackBishop, x:135, y:10},
        {src: blackQueen, x:197.5, y:10},
        {src: blackKing, x:260, y:10},
        {src: blackBishop, x:322.5, y:10},
        {src: blackKnight, x:385, y:10},
        {src: blackRook, x:447.5, y:10},

        {src: blackPawn, x:10, y:72.5},
        {src: blackPawn, x:72.5, y:72.5},
        {src: blackPawn, x:135, y:72.5},
        {src: blackPawn, x:197.5, y:72.5},
        {src: blackPawn, x:260, y:72.5},
        {src: blackPawn, x:322.5, y:72.5},
        {src: blackPawn, x:385, y:72.5},
        {src: blackPawn, x:447.5, y:72.5},

        {src: whiteRook, x:10, y:450},
        {src: whiteKnight, x:72.5, y:450},
        {src: whiteBishop, x:135, y:450},
        {src: whiteQueen, x:197.5, y:450},
        {src: whiteKing, x:260, y:450},
        {src: whiteBishop, x:322.5, y:450},
        {src: whiteKnight, x:385, y:450},
        {src: whiteRook, x:447.5, y:450},

        {src: whitePawn, x:10, y:387.5},
        {src: whitePawn, x:72.5, y:387.5},
        {src: whitePawn, x:135, y:387.5},
        {src: whitePawn, x:197.5, y:387.5},
        {src: whitePawn, x:260, y:387.5},
        {src: whitePawn, x:322.5, y:387.5},
        {src: whitePawn, x:385, y:387.5},
        {src: whitePawn, x:447.5, y:387.5},
        ]

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, 500, 500);
            const squareSize = 62.5;
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
                width={500}
                height={500}
            />
            <MoveImages images={pieces} />
        </div>
    );
};