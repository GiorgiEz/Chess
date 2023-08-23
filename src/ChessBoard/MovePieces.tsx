import React, {useEffect, useMemo} from "react";
import "./ChessBoard.css"
import {PieceType, Positions} from "../types";
import {Canvas} from "../Canvas/Canvas";

import {checkmateOrStalemate} from "../Pieces/AllMoves";
import {getIndexAtPosition, adjustPiecePositions} from "../Canvas/utils";

import {Pawn} from "../Pieces/Pawn";
import {Rook} from "../Pieces/Rook";
import {Button} from "../Canvas/Button";
import {boardSize, canvasHeight, canvasWidth, imageSize, sounds, squareSize} from "../exports";
import {PieceHandler} from "./PieceHandler";

export enum Pieces {
    PAWN = "pawn",
    ROOK = "rook",
    KNIGHT = "knight",
    BISHOP = "bishop",
    QUEEN = "queen",
    KING = "king"
}

interface Props {
    pieces: PieceType[];
    whiteKingName: string;
    blackKingName: string;
}

export const MovePieces: React.FC<Props> = ({pieces, whiteKingName, blackKingName}) => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    let draggingIndex: number = -1
    let mousePosition = {x: 0, y: 0}
    let highlightedSquares: Positions[] = []
    let redSquares: Positions[] = []

    const pieceColors = pieces.map(({color, name}) => ({name, color}))
    const board = pieces.map(({x,y, isAlive}) => ({x, y, isAlive}))

    let pieceImages: HTMLImageElement[] = useMemo(() => {
        const images = [];
        for (let i = 0; i < pieces.length; i++) {
            const image = new Image();
            image.src = pieces[i].src;
            images.push(image)
        }
        return images
    }, [pieces])

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        window.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseUp);
        Canvas.menuScreen = true
        render(ctx)

        return (() => {
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("mousemove", handleMouseMove)
        })
    }, [canvasRef])

    function getMousePositions(event: React.MouseEvent<HTMLCanvasElement> | MouseEvent){
        const canvas = canvasRef.current!;
        const { left, top } = canvas.getBoundingClientRect();
        return {
            x: event.clientX - left,
            y: event.clientY - top,
        }
    }

    function onMouseDown (event: React.MouseEvent<HTMLCanvasElement>) {
        const mousePositions = getMousePositions(event)
        const index = getIndexAtPosition(mousePositions.x, mousePositions.y, board);
        if (index !== -1 && !Pawn.promoteScreenOn && !Canvas.whiteWon && !Canvas.blackWon && !Canvas.staleMate && !Canvas.menuScreen) {
            draggingIndex = index
            mousePosition = {x: mousePositions.x, y: mousePositions.y};
            highlightSquares()
        }
        const button = new Button(mousePosition)

        button.toggleSoundButton()
        button.promotePawnButtons(pieceColors, pieces, pieceImages)
        button.restartGameButton(board, pieceColors, pieceImages)
    }

    const onMouseUp = () => {
        movePieces()
        checkmateOrStalemate(board, pieceColors)

        redSquares = []
        highlightedSquares = []
        draggingIndex = -1;
    }

    const handleMouseMove = (event: MouseEvent) => {
        let {x, y} = getMousePositions(event)
        const canvas = canvasRef.current!;
        canvas.style.cursor = "grabbing";
        //Can't move pieces outside of canvas
        const borderX = canvasWidth - squareSize - imageSize
        const borderY = boardSize - imageSize
        if (x >= borderX) x = borderX
        if (x <= squareSize) x = squareSize
        if (y <= 0) y = 0
        if (y >= borderY) y = borderY
        mousePosition = {x, y};
    }

    const onMouseMove = (event: MouseEvent) => {
        mousePosition = getMousePositions(event)
    }

    const movePieces = () => {
        if (draggingIndex !== -1 && pieces[draggingIndex].isAlive) {
            let {x, y} = adjustPiecePositions(mousePosition)
            let handler = new PieceHandler(mousePosition, board, pieceColors, pieces, draggingIndex, redSquares)

            if (Canvas.turns % 2 === 1 && pieceColors[draggingIndex].color === "black") return;
            if (Canvas.turns % 2 === 0 && pieceColors[draggingIndex].color === "white") return;

            if (pieceColors[draggingIndex].name === Pieces.PAWN && !handler.isValid(handler.handlePawnMovement())) return
            else if (pieceColors[draggingIndex].name === Pieces.PAWN)
                Pawn.setLastMovedPawnIndex(pieceColors, draggingIndex, board, y)
            else Pawn.lastMovedPawnIndex = -1

            if (pieceColors[draggingIndex].name === Pieces.ROOK && !handler.isValid(handler.handleRookMovement())) return;
            else if (pieceColors[draggingIndex].name === Pieces.ROOK) Rook.hasMoved(pieceColors, draggingIndex)

            if (pieceColors[draggingIndex].name === Pieces.KNIGHT && !handler.isValid(handler.handleKnightMovement())) return;

            if (pieceColors[draggingIndex].name === Pieces.BISHOP && !handler.isValid(handler.handleBishopMovement())) return;

            if (pieceColors[draggingIndex].name === Pieces.QUEEN && !handler.isValid(handler.handleQueenMovement())) return;

            if (pieceColors[draggingIndex].name === Pieces.KING && !handler.isValid(handler.handleKingMovement())) return;
            else if (pieceColors[draggingIndex].name === Pieces.KING) Rook.castleRook(board, pieceColors, draggingIndex, x)

            sounds.move_sound.play().then(r => r)
            Canvas.turns ++
            board[draggingIndex] = {x: x, y: y, isAlive: true}
        }
    }

    const highlightSquares = () => {
        if (Canvas.turns % 2 === 1 && pieceColors[draggingIndex].color === "black") return;
        if (Canvas.turns % 2 === 0 && pieceColors[draggingIndex].color === "white") return;

        let handler = new PieceHandler(mousePosition, board, pieceColors, pieces, draggingIndex, redSquares)

        if (pieceColors[draggingIndex].name === Pieces.PAWN) highlightedSquares = handler.handlePawnMovement()
        if (pieceColors[draggingIndex].name === Pieces.ROOK) highlightedSquares = handler.handleRookMovement()
        if (pieceColors[draggingIndex].name === Pieces.KNIGHT) highlightedSquares = handler.handleKnightMovement()
        if (pieceColors[draggingIndex].name === Pieces.BISHOP) highlightedSquares = handler.handleBishopMovement()
        if (pieceColors[draggingIndex].name === Pieces.KING) highlightedSquares = handler.handleKingMovement()
        if (pieceColors[draggingIndex].name === Pieces.QUEEN) highlightedSquares = handler.handleQueenMovement()
    }

    const render = (ctx: CanvasRenderingContext2D) => {
        const canvas = new Canvas(ctx)

        canvas.clearCanvas()
        canvas.drawBoardBackground()
        canvas.drawGreenCircles(highlightedSquares)
        canvas.drawRedBackground(redSquares)
        canvas.drawPieces(board, pieceImages, draggingIndex, mousePosition)
        canvas.drawCoordinates()
        canvas.drawGameOverScreen(mousePosition, whiteKingName, blackKingName)
        canvas.promotionScreen(board, pieceColors, mousePosition)
        canvas.drawKilledPieces()
        canvas.drawMenuScreen()
        canvas.drawSoundButton(mousePosition)
        canvas.displayScoreAndNames(whiteKingName, blackKingName, pieceImages)

        requestAnimationFrame(() => render(ctx));
    }

    return (
        <canvas
            className={"chessboard"}
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={onMouseDown}
        />
    )
}
