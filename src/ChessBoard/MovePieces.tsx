import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import "./ChessBoard.css"
import {Moves, PieceType, Positions} from "../types";
import {Canvas} from "../Canvas/Canvas";

import {checkmateOrStalemate, getPossibleMovesForAllBlackPieces, getPossibleMovesForAllWhitePieces} from "../Pieces/AllMoves";
import {getIndexAtPosition, isPieceOnSquare, adjustPiecePositions, addScore,} from "../Canvas/utils";

import {Pawn} from "../Pieces/Pawn";
import {Rook} from "../Pieces/Rook";
import {Bishop} from "../Pieces/Bishop";
import {Knight} from "../Pieces/Knight";
import {Queen} from "../Pieces/Queen";
import {King} from "../Pieces/King";
import {Button} from "../Canvas/Button";
import {pieceMovementHandler} from "../Pieces/Movements";
import {NamesInput} from "../InputForm/NamesInput";
import {boardSize, canvasHeight, canvasWidth, imageSize, sounds, squareSize} from "../exports";

interface Props {
    pieces: PieceType[];
}

export const MovePieces: React.FC<Props> = ({pieces}) => {
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

    const [whiteKingName, setWhiteKingName] = useState("")
    const [blackKingName, setBlackKingName] = useState("")

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

    const handleWhiteKingInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setWhiteKingName(value);
    }, []);

    const handleBlackKingInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setBlackKingName(value);
    }, []);

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
        if (index !== -1 && !Pawn.promoteScreenOn && !Canvas.whiteWon && !Canvas.blackWon && !Canvas.staleMate && !Canvas.menuScreen) {
            draggingIndex = index
            mousePosition = {x: mousePositions.x, y: mousePositions.y};
            highlightValidMoveSquares()
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
        Pawn.enPassantMove(killedPiecePos, board, pieceColors, draggingIndex, pieces)
        let killedPieceIndex = getIndexAtPosition(killedPiecePos.x, killedPiecePos.y, board)
        if (isPieceOnSquare(killedPiecePos.x, killedPiecePos.y, board) && pieceColors[killedPieceIndex] &&
            pieceColors[killedPieceIndex].color !== pieceColors[draggingIndex].color) {
            sounds.capture_sound.play()

            board[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
            if (pieceColors[killedPieceIndex].color === "white") {
                Canvas.blackScore += addScore(killedPieceIndex, pieceColors)
                Canvas.whiteKilledPieces.push(pieces[killedPieceIndex])
            }
            else {
                Canvas.whiteScore += addScore(killedPieceIndex, pieceColors)
                Canvas.blackKilledPieces.push(pieces[killedPieceIndex])
            }
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

    const handleQueenMovement = () => {
        return pieceMovementHandler(new Queen(), board, pieceColors, draggingIndex, redSquares)
    }

    const handleRookMovement = () => {
        return pieceMovementHandler(new Rook(), board, pieceColors, draggingIndex, redSquares)
    }

    const handleBishopMovement = () => {
        return pieceMovementHandler(new Bishop(), board, pieceColors, draggingIndex, redSquares)
    }

    const handleKnightMovement = () => {
        return pieceMovementHandler(new Knight(), board, pieceColors, draggingIndex, redSquares)
    }

    const handlePawnMovement = () => {
        return pieceMovementHandler(new Pawn(), board, pieceColors, draggingIndex, redSquares)
    }

    const movePieces = () => {
        if (draggingIndex !== -1 && pieces[draggingIndex].isAlive) {
            let {x, y} = adjustPiecePositions(mousePosition)

            if (Canvas.turns % 2 === 1 && pieceColors[draggingIndex].color === "black") return;
            if (Canvas.turns % 2 === 0 && pieceColors[draggingIndex].color === "white") return;

            if (pieceColors[draggingIndex].name === "pawn" && !checkIfValid(handlePawnMovement())) return
            else if (pieceColors[draggingIndex].name === "pawn")
                Pawn.setLastMovedPawnIndex(pieceColors, draggingIndex, board, y)
            else Pawn.lastMovedPawnIndex = -1

            if (pieceColors[draggingIndex].name === "rook" && !checkIfValid(handleRookMovement())) return;
            else if (pieceColors[draggingIndex].name === "rook") Rook.hasMoved(pieceColors, draggingIndex)

            if (pieceColors[draggingIndex].name === "knight" && !checkIfValid(handleKnightMovement())) return;

            if (pieceColors[draggingIndex].name === "bishop" && !checkIfValid(handleBishopMovement())) return;

            if (pieceColors[draggingIndex].name === "queen" && !checkIfValid(handleQueenMovement())) return;

            if (pieceColors[draggingIndex].name === "king" && !checkIfValid(handleKingMovement())) return;
            else if (pieceColors[draggingIndex].name === "king") Rook.castleRook(board, pieceColors, draggingIndex, x)

            sounds.move_sound.play()
            Canvas.turns += 1
            board[draggingIndex] = {x: x, y: y, isAlive: true}
        }
    }

    const highlightValidMoveSquares = () => {
        if (Canvas.turns % 2 === 1 && pieceColors[draggingIndex].color === "black") return;
        if (Canvas.turns % 2 === 0 && pieceColors[draggingIndex].color === "white") return;

        if (pieceColors[draggingIndex].name === "pawn") highlightedSquares = handlePawnMovement()
        if (pieceColors[draggingIndex].name === "rook") highlightedSquares = handleRookMovement()
        if (pieceColors[draggingIndex].name === "knight") highlightedSquares = handleKnightMovement()
        if (pieceColors[draggingIndex].name === "bishop") highlightedSquares = handleBishopMovement()
        if (pieceColors[draggingIndex].name === "king") highlightedSquares = handleKingMovement()
        if (pieceColors[draggingIndex].name === "queen") highlightedSquares = handleQueenMovement()
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
        <div>
            <canvas
                className={"chessboard"}
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseDown={onMouseDown}
            />
            <NamesInput
                handleBlackKingInput={handleBlackKingInput}
                handleWhiteKingInput={handleWhiteKingInput}
            />
        </div>
    )
}
