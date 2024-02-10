import React, {useEffect} from "react";
import {Positions} from "../Utils/types";
import {Canvas} from "../Canvas/Canvas";
import {getPieceAtPosition} from "../Utils/utilFunctions";
import {Button} from "../Canvas/Button";
import {PieceHandler} from "./PieceHandler";
import Game from "./Game";

export const RenderCanvas: React.FC = () => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    const game = Game.getInstance()

    let mousePosition = {x: 0, y: 0}
    let highlightedMoves: Positions[] = []

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseUp);
        window.addEventListener("mousemove", handleMouseMove);
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
        const piece = getPieceAtPosition(x, y);
        if (piece !== null && !game.isPromotionScreenOn && !game.whiteWon && !game.blackWon && !game.staleMate && !game.isMenuScreenOn) {
            game.draggingPiece = piece
            mousePosition = {x, y};

            let handler = new PieceHandler(mousePosition)
            highlightedMoves = handler.highlightSquares() as Positions[]
        }

        const button = new Button(x, y)

        button.toggleSoundButton()
        button.promotePawnButtons()
        button.restartGameButton()
        button.playButton()
    }

    const onMouseUp = () => {
        let handler = new PieceHandler(mousePosition)
        handler.movePieces()
        handler.isCheckmateOrStalemate()

        if (game.pieceMoved) {
            highlightedMoves = []
            game.pieceMoved = false
        }
        game.threatenedSquares = []
        game.draggingPiece = null
    }

    const handleMouseMove = (event: MouseEvent) => {
        let {x, y} = getMousePositions(event)
        const canvas = canvasRef.current!;
        canvas.style.cursor = "grabbing";

        //Can't move pieces outside of canvas
        const borderX = game.canvasSize - game.imageSize
        const borderY = game.canvasSize - game.imageSize
        if (x >= borderX) {
            x = borderX
        }
        if (x <= 0) {
            x = 0
        }
        if (y <= 0) {
            y = 0
        }
        if (y >= borderY) {
            y = borderY
        }
        mousePosition = {x, y};
    }

    const onMouseMove = (event: MouseEvent) => {
        mousePosition = getMousePositions(event)
    }

    const render = (ctx: CanvasRenderingContext2D) => {
        const canvas = new Canvas(ctx, mousePosition)

        canvas.clearCanvas()
        canvas.drawBoardBackground()
        canvas.drawHighlightingCircles(highlightedMoves)
        canvas.drawThreatenedSquares()
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
            height={game.canvasSize}
            width={game.canvasSize}
            onMouseDown={onMouseDown}
        ></canvas>
    )
}
