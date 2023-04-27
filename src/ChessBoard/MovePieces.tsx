import React, {useEffect, useMemo} from "react";
import "./ChessBoard.css"
import {Moves, PieceType, Positions, ValidMoves} from "../Canvas/types";
import {Canvas} from "../Canvas/Canvas";

import {Pawn} from "../Pieces/Pawn";
import {Rook} from "../Pieces/Rook";
import {Bishop} from "../Pieces/Bishop";
import {Knight} from "../Pieces/Knight";
import {Queen} from "../Pieces/Queen";
import {King} from "../Pieces/King";
import {getPossibleMovesForAllBlackPieces, getPossibleMovesForAllWhitePieces} from "../Pieces/AllMoves";

import {
    canvasSize, imageSize,
    adjustPiecePositions, getCurrPos, getIndexAtPosition, isPieceOnSquare, movementHandler
} from "../Canvas/utils";

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
    const positions = pieces.map(({x,y, isAlive}) => ({x, y, isAlive}))

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
        if (index !== -1 && !Pawn.promoteScreenOn) {
            draggingIndex = index
            mousePosition = {x: mousePositions.x, y: mousePositions.y};
            highlightValidMoveSquares()
        }
        const pawn = new Pawn()
        pawn.promotePawn(mousePosition, pieceColors, pieces, pieceImages)
    }

    const onMouseUp = () => {
        movePieces()
        draggingIndex = -1;
        greenSquares = []
        redSquares = []
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

    // check if the position where the piece is moved is in the valid positions array
    function checkIfValid (validMoves: Moves[]) {
        let {x, y} = adjustPiecePositions(mousePosition)
        for (let move of validMoves) {
            if (x === move.x && y === move.y) {
                killPieces({x: move.x, y: move.y}); return true
            }
        }
        return false
    }

    function killPieces (killedPiecePos: Positions) {
        const killedPieceIndex = getIndexAtPosition(killedPiecePos.x, killedPiecePos.y, positions)
        if (isPieceOnSquare(killedPiecePos.x, killedPiecePos.y, positions) && pieceColors[killedPieceIndex] &&
            pieceColors[killedPieceIndex].color !== pieceColors[draggingIndex].color) {
            positions[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
        }
        return killedPieceIndex
    }

    const handleKingMovement = () =>  {
        const king = new King()
        if (pieceColors[draggingIndex].color === "white") {
            return king.kingMovementHandler(King.white_king.index, redSquares,
                positions, pieceColors, getPossibleMovesForAllBlackPieces)
        }
        else return king.kingMovementHandler(King.black_king.index, redSquares,
                positions, pieceColors, getPossibleMovesForAllWhitePieces)
    }

    const pieceMovementHandler = (piece: ValidMoves) => {
        let whiteKing = {x: positions[King.white_king.index].x, y: positions[King.white_king.index].y}
        let blackKing = {x: positions[King.black_king.index].x, y: positions[King.black_king.index].y}
        if (pieceColors[draggingIndex].color === "white") {
            return movementHandler(whiteKing, draggingIndex, positions, pieceColors, redSquares,
                getPossibleMovesForAllBlackPieces, piece.validMoves)
        }
        else return movementHandler(blackKing, draggingIndex, positions, pieceColors, redSquares,
            getPossibleMovesForAllWhitePieces, piece.validMoves)
    }

    const handleQueenMovement = () => {
        return pieceMovementHandler(new Queen())
    }

    const handleRookMovement = () => {
        return pieceMovementHandler(new Rook())
    }

    const handleBishopMovement = () => {
        return pieceMovementHandler(new Bishop())
    }

    const handleKnightMovement = () => {
        return pieceMovementHandler(new Knight())
    }

    const handlePawnMovement = () => {
        return pieceMovementHandler(new Pawn())
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

            positions[draggingIndex] = {x: x, y: y, isAlive: true}
        }
    }

    const highlightValidMoveSquares = () => {
        if (pieceColors[draggingIndex].name === "pawn") greenSquares = handlePawnMovement()
        if (pieceColors[draggingIndex].name === "rook") greenSquares = handleRookMovement()
        if (pieceColors[draggingIndex].name === "knight") greenSquares = handleKnightMovement()
        if (pieceColors[draggingIndex].name === "bishop") greenSquares = handleBishopMovement()
        if (pieceColors[draggingIndex].name === "king") greenSquares = handleKingMovement()
        if (pieceColors[draggingIndex].name === "queen") greenSquares = handleQueenMovement()
    }

    const render = (ctx: CanvasRenderingContext2D) => {
        const king = new King()
        const canvas = new Canvas(ctx)

        ctx.clearRect(0, 0, canvasSize, canvasSize);

        canvas.drawBoardBackground()
        canvas.drawGreenCircles(greenSquares)
        canvas.drawRedBackground(redSquares)
        canvas.drawPieces(positions, pieceImages, draggingIndex, mousePosition)
        canvas.drawCoordinates()
        canvas.promotionScreen(positions, pieceColors, mousePosition)

        king.moveRook(mousePosition, positions)
        king.isMoved(positions)

        requestAnimationFrame(() => render(ctx));
    }

    return (
        <canvas
            className={"chessboard"}
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            onMouseDown={onMouseDown}
        />
    )
}
