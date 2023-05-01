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
    imageSize, canvasSize, squareSize, shiftImage,
    adjustPiecePositions, getIndexAtPosition, isPieceOnSquare,
    movementHandler, checkmateOrStalemate, restartGame
} from "../Canvas/utils";
import {promotePawn} from "../Canvas/Promotion";

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
        const index = getIndexAtPosition(mousePositions.x, mousePositions.y, board);
        if (index !== -1 && !Pawn.promoteScreenOn && !Canvas.whiteWon && !Canvas.blackWon && !Canvas.staleMate) {
            draggingIndex = index
            mousePosition = {x: mousePositions.x, y: mousePositions.y};
            highlightValidMoveSquares()
        }
        promotePawn(mousePosition, pieceColors, pieces, pieceImages)
        restartGame(mousePosition, board, pieceColors, pieceImages)
    }

    const onMouseUp = () => {
        movePieces()
        checkmateOrStalemate(board, pieceColors)

        draggingIndex = -1;
        redSquares = []
        greenSquares = []
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

    // check if the position where the piece is moved is in the valid board array
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
        const killedPieceIndex = getIndexAtPosition(killedPiecePos.x, killedPiecePos.y, board)
        if (isPieceOnSquare(killedPiecePos.x, killedPiecePos.y, board) && pieceColors[killedPieceIndex] &&
            pieceColors[killedPieceIndex].color !== pieceColors[draggingIndex].color) {
            board[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
            Canvas.killedPieces.push(pieces[killedPieceIndex])
        }
        return killedPieceIndex
    }

    const handleKingMovement = () =>  {
        const king = new King()
        if (pieceColors[draggingIndex].color === "white") {
            return king.kingMovementHandler(King.white_king.index, redSquares,
                board, pieceColors, getPossibleMovesForAllBlackPieces)
        }
        else return king.kingMovementHandler(King.black_king.index, redSquares,
                board, pieceColors, getPossibleMovesForAllWhitePieces)
    }

    const pieceMovementHandler = (piece: ValidMoves) => {
        let whiteKing = {x: board[King.white_king.index].x, y: board[King.white_king.index].y}
        let blackKing = {x: board[King.black_king.index].x, y: board[King.black_king.index].y}

        if (pieceColors[draggingIndex].color === "white") {
            return movementHandler(whiteKing, draggingIndex, board, pieceColors, redSquares,
                getPossibleMovesForAllBlackPieces, piece.validMoves)
        }
        else return movementHandler(blackKing, draggingIndex, board, pieceColors, redSquares,
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
            let {x, y} = adjustPiecePositions(mousePosition)

            // if (Canvas.turns % 2 === 1 && pieceColors[draggingIndex].color === "black") return;
            // if (Canvas.turns % 2 === 0 && pieceColors[draggingIndex].color === "white") return;

            if (pieceColors[draggingIndex].name === "pawn" && !checkIfValid(handlePawnMovement())) return
            // else if (pieceColors[draggingIndex].name === "pawn"){
            //     if (pieceColors[draggingIndex].color === "white"){
            //         if (board[draggingIndex].y - y === 150){
            //             console.log(draggingIndex)
            //             Canvas.lastMovedPawn = draggingIndex
            //         }
            //     }
            // } else Canvas.lastMovedPawn = -1

            if (pieceColors[draggingIndex].name === "rook" && !checkIfValid(handleRookMovement())) return;
            else if (pieceColors[draggingIndex].name === "rook"){
                if (pieceColors[draggingIndex].color === "white"){
                    if (draggingIndex === Rook.leftWhiteRook.index) Rook.leftWhiteRook.hasMoved = true
                    if (draggingIndex === Rook.rightWhiteRook.index) Rook.rightWhiteRook.hasMoved = true
                }
                else {
                    if (draggingIndex === Rook.leftBlackRook.index) Rook.leftBlackRook.hasMoved = true
                    if (draggingIndex === Rook.rightBlackRook.index) Rook.rightBlackRook.hasMoved = true
                }
            }

            if (pieceColors[draggingIndex].name === "knight" && !checkIfValid(handleKnightMovement())) return;

            if (pieceColors[draggingIndex].name === "bishop" && !checkIfValid(handleBishopMovement())) return;

            if (pieceColors[draggingIndex].name === "queen" && !checkIfValid(handleQueenMovement())) return;

            if (pieceColors[draggingIndex].name === "king" && !checkIfValid(handleKingMovement())) return;
            else if (pieceColors[draggingIndex].name === "king"){
                //Move rook if king moves to castling position and set king.hasMoved to true
                const kingCastlePosRight = canvasSize-2*squareSize+shiftImage
                const kingCastlePosLeft = 2*squareSize+shiftImage
                if (pieceColors[draggingIndex].color === "white" && !King.white_king.hasMoved) {
                    if (x === kingCastlePosRight) board[Rook.rightWhiteRook.index].x = canvasSize / 2 + squareSize + shiftImage
                    if (x === kingCastlePosLeft) board[Rook.leftWhiteRook.index].x = canvasSize / 2 + shiftImage - squareSize
                    King.white_king.hasMoved = true
                }
                if (pieceColors[draggingIndex].color === "black" && !King.black_king.hasMoved){
                    if (x === kingCastlePosRight) board[Rook.rightBlackRook.index].x = canvasSize / 2 + squareSize + shiftImage
                    if (x === kingCastlePosLeft) board[Rook.leftBlackRook.index].x = canvasSize / 2 + shiftImage - squareSize
                    King.black_king.hasMoved = true
                }
            }

            Canvas.turns += 1
            board[draggingIndex] = {x: x, y: y, isAlive: true}
        }
    }

    const highlightValidMoveSquares = () => {
        // if (Canvas.turns % 2 === 1 && pieceColors[draggingIndex].color === "black") return;
        // if (Canvas.turns % 2 === 0 && pieceColors[draggingIndex].color === "white") return;

        if (pieceColors[draggingIndex].name === "pawn") greenSquares = handlePawnMovement()
        if (pieceColors[draggingIndex].name === "rook") greenSquares = handleRookMovement()
        if (pieceColors[draggingIndex].name === "knight") greenSquares = handleKnightMovement()
        if (pieceColors[draggingIndex].name === "bishop") greenSquares = handleBishopMovement()
        if (pieceColors[draggingIndex].name === "king") greenSquares = handleKingMovement()
        if (pieceColors[draggingIndex].name === "queen") greenSquares = handleQueenMovement()
    }

    const render = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        const canvas = new Canvas(ctx)

        canvas.drawBoardBackground()
        canvas.drawGreenCircles(greenSquares)
        canvas.drawRedBackground(redSquares)
        canvas.drawPieces(board, pieceImages, draggingIndex, mousePosition)
        canvas.drawCoordinates()
        canvas.drawGameOverScreen(mousePosition)
        canvas.promotionScreen(board, pieceColors, mousePosition)

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
