import React, {useEffect} from "react";
import {Positions} from "../types";
import {Canvas} from "../Canvas/Canvas";
import {getIndexAtPosition, setupChessBoard} from "../utils";
import {Pawn} from "../Pieces/Pawn";
import {Button} from "../Canvas/Button";
import {canvasSize, imageSize} from "../exports";
import {PieceHandler} from "./PieceHandler";
import {Team} from "./Team";

export const RenderCanvas: React.FC = () => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    let draggingIndex: number = -1
    let mousePosition = {x: 0, y: 0}
    let availableMoves: Positions[] = []
    let threatenedSquares: Positions[] = []
    const board = setupChessBoard();

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

    const getMousePositions = (event: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
        const canvas = canvasRef.current!;
        const { left, top } = canvas.getBoundingClientRect();
        return {
            x: event.clientX - left,
            y: event.clientY - top,
        }
    }

    const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const {x, y} = getMousePositions(event)
        const index = getIndexAtPosition(x, y, board);
        if (index !== -1 && !Pawn.promoteScreenOn && !Team.whiteWon && !Team.blackWon && !Team.staleMate && !Canvas.menuScreen) {
            draggingIndex = index
            mousePosition = {x, y};

            let handler = new PieceHandler(mousePosition, board, draggingIndex, threatenedSquares)
            availableMoves = handler.highlightSquares() as Positions[]
        }
        const button = new Button(x, y, board)

        button.toggleSoundButton()
        button.promotePawnButtons()
        button.restartGameButton()
        button.playButton()
    }

    const onMouseUp = () => {
        let handler = new PieceHandler(mousePosition, board, draggingIndex, threatenedSquares)
        handler.movePieces()
        handler.isCheckmateOrStalemate()

        if (PieceHandler.pieceMoved) {
            availableMoves = []
            PieceHandler.pieceMoved = false
        }
        threatenedSquares = []
        draggingIndex = -1;
    }

    const handleMouseMove = (event: MouseEvent) => {
        let {x, y} = getMousePositions(event)
        const canvas = canvasRef.current!;
        canvas.style.cursor = "grabbing";

        //Can't move pieces outside of canvas
        const borderX = canvasSize - imageSize
        const borderY = canvasSize - imageSize
        if (x >= borderX) x = borderX
        if (x <= 0) x = 0
        if (y <= 0) y = 0
        if (y >= borderY) y = borderY
        mousePosition = {x, y};
    }

    const onMouseMove = (event: MouseEvent) => {
        mousePosition = getMousePositions(event)
    }

    const render = (ctx: CanvasRenderingContext2D) => {
        const canvas = new Canvas(ctx, mousePosition, draggingIndex, board)

        canvas.clearCanvas()
        canvas.drawBoardBackground()
        canvas.drawHighlightingCircles(availableMoves)
        canvas.drawRedBackground(threatenedSquares)
        canvas.drawPieces()
        canvas.drawCoordinates()
        canvas.drawGameOverScreen()
        canvas.promotionScreen()
        canvas.drawMenuScreen()
        canvas.drawSoundButton()
        canvas.drawPlayButton()

        requestAnimationFrame(() => render(ctx));
    }

    return (
        <canvas
            ref={canvasRef}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            height={canvasSize}
            width={canvasSize}
            onMouseDown={onMouseDown}
        ></canvas>
    )
}
