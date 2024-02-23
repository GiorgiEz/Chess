import React, {useEffect} from "react";
import {Canvas} from "../Canvas/Canvas";
import {getPieceAtPosition} from "../Utils/utilFunctions";
import {Button} from "../Canvas/Button";
import {GameManager} from "./GameManager";
import Game from "./Game";

export const RenderCanvas: React.FC = () => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    const game = Game.getInstance()

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
            game.mousePosition = {x, y};

            game.highlightedMoves =  new GameManager().highlightSquares()
        }

        const button = new Button(x, y)

        button.toggleSoundButton()
        button.promotePawnButtons()
        button.restartGameButton()
        button.playButton()
    }

    const onMouseUp = () => {
        let handler = new GameManager()
        handler.movePieces()
        handler.isCheckmateOrStalemate()

        if (game.pieceMoved) {
            game.highlightedMoves = []
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
        const borderX = game.canvasSize - 2*game.shiftImage
        const borderY = game.canvasSize - 2*game.shiftImage
        if (x >= borderX) {
            x = borderX
        }
        if (x <= 2*game.shiftImage) {
            x = 2*game.shiftImage
        }
        if (y <= 2*game.shiftImage) {
            y = 2*game.shiftImage
        }
        if (y >= borderY) {
            y = borderY
        }
        game.mousePosition = {x, y};
    }

    const onMouseMove = (event: MouseEvent) => {
        game.mousePosition = getMousePositions(event)
    }

    const render = (ctx: CanvasRenderingContext2D) => {
        const canvas = new Canvas(ctx)

        canvas.clearCanvas()
        canvas.drawBoardBackground()
        canvas.drawHighlightingCircles()
        canvas.drawThreatenedSquares()
        canvas.drawPieces()
        canvas.drawCoordinates()
        canvas.drawGameOverScreen()
        canvas.promotionScreen()
        canvas.drawMenuScreen()
        canvas.drawSoundButton()
        canvas.drawPlayButton()

        requestAnimationFrame(() => render(ctx))
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
