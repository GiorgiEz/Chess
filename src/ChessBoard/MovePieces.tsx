import React, {useEffect, useMemo, useState} from "react";
import "./ChessBoard.css"
import {Moves, PieceType, Positions} from "../Utils/types";

import {pawnPossibleMoves, pawnPromotionScreen, promotePawn, promoteScreenOn} from "../Pieces/Pawn";
import {rookValidMoves} from "../Pieces/Rook";
import {Bishop, bishopValidMoves} from "../Pieces/Bishop";
import {knightValidMoves} from "../Pieces/Knight";
import {queenValidMoves} from "../Pieces/Queen";
import {kingMovementHandler, black_king_index, white_king_index} from "../Pieces/King";
import {getPossibleMovesForAllBlackPieces, getPossibleMovesForAllWhitePieces} from "../Utils/AllMoves";

import {
    canvasSize, squareSize, imageSize,
    adjustPiecePositions, getCurrPos, getIndexAtPosition, isPieceOnSquare, movementHandler, images
} from "../Utils/utils";
import Piece from "../Pieces/Piece";

interface Props {
    pieces: PieceType[];
}

export const MovePieces: React.FC<Props> = ({pieces}) => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    let draggingIndex: number = -1
    let mousePosition = {x: 0, y: 0}
    let greenSquares: Positions[] = []
    let redSquares: Positions[] = []
    const pieceColors = pieces.map(({color, name}) => ({name, color}))
    const [positions, setPositions] = useState(pieces.map(({x,y, isAlive}) => ({x, y, isAlive})));

    let white_king = {x: positions[white_king_index].x, y: positions[white_king_index].y}
    let black_king = {x: positions[black_king_index].x, y: positions[black_king_index].y}

    let pieceImages: HTMLImageElement[] = useMemo(() => {
        const images = [];
        for (let i = 0; i < pieces.length; i++) {
            const image = new Image();
            image.src = pieces[i].src;
            images.push(image)
        }
        return images
    }, [pieces]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        window.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseUp);
        render(ctx)

        return (() => {
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("mousemove", handleMouseMove)
        })
    }, [canvasRef])

    function getMousePositions(event: any){
        const canvas = canvasRef.current!;
        const { left, top } = canvas.getBoundingClientRect();
        return {
            x: event.clientX - left,
            y: event.clientY - top,
        }
    }

    function onMouseDown (event: React.MouseEvent<HTMLCanvasElement>) {
        const mousePositions = getMousePositions(event)
        const index = getIndexAtPosition(mousePositions.x, mousePositions.y, positions);
        if (index !== -1 && !promoteScreenOn) {
            draggingIndex = index
            mousePosition = {x: mousePositions.x, y: mousePositions.y};
            colorSquares()
        }
        promotePawn(mousePosition, pieceColors, pieces, pieceImages)
    }

    const onMouseUp = () => {
        movePieces()
        draggingIndex = -1;
    }

    const handleMouseMove = (event: MouseEvent) => {
        let {x, y} = getMousePositions(event)
        const canvas = canvasRef.current!;
        canvas.style.cursor = "grabbing";
        //Can't move pieces outside of canvas
        const border = canvasSize - imageSize
        if (x >= border) x = border
        if (x <= 0) x = 0
        if (y <= 0) y = 0
        if (y >= border) y = border
        mousePosition = { x: x, y: y };
    }

    const onMouseMove = (event: MouseEvent) => {
        mousePosition = getMousePositions(event);
    }

    function checkIfValid (validMoves: Moves[]) {
        let {x, y} = adjustPiecePositions(mousePosition)
        let isValidMove = false;
        for (let move of validMoves) {
            if (x === move.x && y === move.y) {
                isValidMove = true
                killPieces({x: move.x, y: move.y})
                break
            }
        }
        return isValidMove
    }

    function killPieces (killedPiecePos: Positions) {
        const killedPieceIndex = getIndexAtPosition(killedPiecePos.x, killedPiecePos.y, positions)
        if (isPieceOnSquare(killedPiecePos.x, killedPiecePos.y, positions) && pieceColors[killedPieceIndex] &&
            pieceColors[killedPieceIndex].color !== pieceColors[draggingIndex].color) {
            positions[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
        }
        return killedPieceIndex
    }

    function handleKingMovement() {
        if (pieceColors[draggingIndex].color === "white")
            return kingMovementHandler(white_king_index, positions, pieceColors,
                redSquares, getPossibleMovesForAllBlackPieces)
        else return kingMovementHandler(black_king_index, positions, pieceColors,
            redSquares, getPossibleMovesForAllWhitePieces)
    }

    const handleQueenMovement = () => {
        if (pieceColors[draggingIndex].color === "white") {
            return movementHandler(white_king, draggingIndex, positions, pieceColors, redSquares,
            getPossibleMovesForAllBlackPieces, queenValidMoves)
        }
        else return movementHandler(black_king, draggingIndex, positions, pieceColors, redSquares,
            getPossibleMovesForAllWhitePieces, queenValidMoves)
    }

    const handleRookMovement = () => {
        if (pieceColors[draggingIndex].color === "white") {
            return movementHandler(white_king, draggingIndex, positions, pieceColors, redSquares,
                getPossibleMovesForAllBlackPieces, rookValidMoves)
        }
        else return movementHandler(black_king, draggingIndex, positions, pieceColors, redSquares,
            getPossibleMovesForAllWhitePieces, rookValidMoves)
    }

    const handleBishopMovement = () => {
        if (pieceColors[draggingIndex].color === "white") {
            return movementHandler(white_king, draggingIndex, positions, pieceColors, redSquares,
                getPossibleMovesForAllBlackPieces,bishopValidMoves)
        }
        else return movementHandler(black_king, draggingIndex, positions, pieceColors, redSquares,
            getPossibleMovesForAllWhitePieces, bishopValidMoves)
    }

    const handleKnightMovement = () => {
        if (pieceColors[draggingIndex].color === "white") {
            return movementHandler(white_king, draggingIndex, positions, pieceColors, redSquares,
                getPossibleMovesForAllBlackPieces, knightValidMoves)
        }
        else return movementHandler(black_king, draggingIndex, positions, pieceColors, redSquares,
            getPossibleMovesForAllWhitePieces, knightValidMoves)
    }

    const handlePawnMovement = () => {
        if (pieceColors[draggingIndex].color === "white") {
            return movementHandler(white_king, draggingIndex, positions, pieceColors, redSquares,
                getPossibleMovesForAllBlackPieces, pawnPossibleMoves)
        }
        else return movementHandler(black_king, draggingIndex, positions, pieceColors, redSquares,
            getPossibleMovesForAllWhitePieces, pawnPossibleMoves)
    }

    const movePieces = () => {
        if (draggingIndex !== -1 && pieces[draggingIndex].isAlive) {
            const {currX, currY} = getCurrPos(draggingIndex, positions)
            let {x, y} = adjustPiecePositions(mousePosition)

            const resetPosition = () => {
                x = currX
                y = currY
            }
            if (pieceColors[draggingIndex].name === "pawn" && !checkIfValid(handlePawnMovement())) resetPosition()
            if (pieceColors[draggingIndex].name === "rook" && !checkIfValid(handleRookMovement())) resetPosition()
            if (pieceColors[draggingIndex].name === "knight" && !checkIfValid(handleKnightMovement())) resetPosition()
            if (pieceColors[draggingIndex].name === "bishop" && !checkIfValid(handleBishopMovement())) resetPosition()
            if (pieceColors[draggingIndex].name === "queen" && !checkIfValid(handleQueenMovement())) resetPosition()
            if (pieceColors[draggingIndex].name === "king" && !checkIfValid(handleKingMovement())) resetPosition()

            const positionsArr = [...positions]
            positionsArr[draggingIndex] = {x: x, y: y, isAlive: true}
            setPositions(positionsArr)
        }
    }

    const colorSquares = () => {
        if (pieceColors[draggingIndex].name === "pawn"){
            for (let move of handlePawnMovement()){
                if (!isPieceOnSquare(move.x, move.y, positions)) greenSquares.push(move)
                else if (isPieceOnSquare(move.x, move.y, positions) &&
                    pieceColors[move.index].color !== pieceColors[draggingIndex].color){
                    redSquares.push(move)
                }
            }
        }
        if (pieceColors[draggingIndex].name === "rook") greenSquares = handleRookMovement()
        if (pieceColors[draggingIndex].name === "knight") greenSquares = handleKnightMovement()
        if (pieceColors[draggingIndex].name === "bishop") greenSquares = handleBishopMovement()
        if (pieceColors[draggingIndex].name === "king") greenSquares = handleKingMovement()
        if (pieceColors[draggingIndex].name === "queen") greenSquares = handleQueenMovement()
    }

    const drawGreenCircles = (ctx: CanvasRenderingContext2D) => {
        for (let pos of greenSquares) {
            const gradient = ctx.createRadialGradient(pos.x + 25, pos.y + 25,
                0, pos.x + 25, pos.y + 25, squareSize / 4
            );
            gradient.addColorStop(0, "#06f67d");
            gradient.addColorStop(1, "#066e52");

            ctx.beginPath();
            ctx.arc(pos.x + 25, pos.y + 25, squareSize / 8, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    const drawRedBackground = (ctx: CanvasRenderingContext2D) => {
        for (let pos of redSquares) {
            ctx.fillStyle = "#b20101"
            ctx.fillRect(pos.x - 10, pos.y - 10, squareSize - 5, squareSize - 5);
        }
    }

    const drawBoardBackground = (ctx: CanvasRenderingContext2D) => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * squareSize;
                const y = row * squareSize;
                ctx.fillStyle = (row + col) % 2 === 0 ? "#1A233B" : "#808080"
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }

    const drawPieces = (ctx: CanvasRenderingContext2D) => {
        for (let i = 0; i < pieces.length; i++) {
            if (positions[i].isAlive) {
                const image = pieceImages[i];
                let {x, y} = positions[i];
                // If the piece is being dragged, draw it at the current mouse position
                if (i === draggingIndex) {
                    x = mousePosition.x;
                    y = mousePosition.y;
                }
                ctx.drawImage(image, x, y, imageSize, imageSize);
            }
        }
    }

    const render = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        drawBoardBackground(ctx)
        drawGreenCircles(ctx)
        drawRedBackground(ctx)
        drawPieces(ctx)

        pawnPromotionScreen(positions, ctx, pieceColors)

        requestAnimationFrame(() => render(ctx));
    }

    return (
        <div>
            <canvas
                className={"chessboard"}
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                onMouseDown={onMouseDown}
            />
        </div>
    )
}