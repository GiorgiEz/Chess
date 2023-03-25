import React, { useRef, useEffect } from 'react';
import './ChessBoard.css';

interface ChessboardProps {
    width: number;
    height: number;
}

const ChessBoard: React.FC<ChessboardProps> = ({ width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const squareSize = Math.min(width, height) / 8;
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const x = col * squareSize;
                        const y = row * squareSize;
                        ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
                        ctx.fillRect(x, y, squareSize, squareSize);
                    }
                }
            }
        }
    }, [canvasRef, width, height]);

    return (
        <canvas className="chessboard" ref={canvasRef} width={width} height={height}/>
    );
};

export default ChessBoard;