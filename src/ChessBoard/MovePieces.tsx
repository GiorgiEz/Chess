import React, {useEffect, useMemo} from "react";
import "./ChessBoard.css"
import {PieceType, Positions} from "../types";
import {Canvas} from "../Canvas/Canvas";
import {getIndexAtPosition, createImage} from "../Canvas/utils";
import {Pawn} from "../Pieces/Pawn";
import {Button} from "../Canvas/Button";
import {boardSize, canvasHeight, canvasWidth, imageSize, squareSize} from "../exports";
import {PieceHandler} from "./PieceHandler";
import {Team} from "./Team";

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
            images.push(createImage(pieces[i].src))
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
        const {x, y} = getMousePositions(event)
        const index = getIndexAtPosition(x, y, board);
        if (index !== -1 && !Pawn.promoteScreenOn && !Team.whiteWon && !Team.blackWon && !Team.staleMate && !Canvas.menuScreen) {
            draggingIndex = index
            mousePosition = {x, y};

            let handler = new PieceHandler(mousePosition, board, pieceColors, pieces, draggingIndex, redSquares)
            highlightedSquares = handler.highlightSquares() as Positions[]
        }
        const button = new Button(x, y, board, pieces, pieceColors, pieceImages)

        button.toggleSoundButton()
        button.promotePawnButtons()
        button.restartGameButton()
    }

    const onMouseUp = () => {
        let handler = new PieceHandler(mousePosition, board, pieceColors, pieces, draggingIndex, redSquares)
        handler.movePieces()
        handler.isCheckmateOrStalemate()

        if (PieceHandler.pieceMoved) {
            highlightedSquares = []
            PieceHandler.pieceMoved = false
        }
        redSquares = []
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

    const render = (ctx: CanvasRenderingContext2D) => {
        const canvas = new Canvas(ctx, mousePosition, draggingIndex, board, pieceImages, whiteKingName, blackKingName, pieceColors)

        canvas.clearCanvas()
        canvas.drawBoardBackground()
        canvas.drawHighlightingCircles(highlightedSquares)
        canvas.drawRedBackground(redSquares)
        canvas.drawPieces()
        canvas.drawCoordinates()
        canvas.drawGameOverScreen()
        canvas.promotionScreen()
        canvas.drawKilledPieces()
        canvas.drawMenuScreen()
        canvas.drawSoundButton()
        canvas.displayScoreAndNames()

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
