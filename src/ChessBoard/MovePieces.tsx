import React, {useEffect, useMemo, useState} from "react";
import "./ChessBoard.css"
import {Piece} from "./ChessBoard";

interface Props {
    pieces: Piece[];
}

type Moves = {
    x: number,
    y:number,
    index: number
}

export const MovePieces: React.FC<Props> = ({pieces}) => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    const squareSize = 75;
    const canvasSize = 600;
    const imageSize = 50;
    let draggingIndex: number = -1
    let mousePosition = {x: 0, y: 0}
    const color_name_arr = pieces.map(({color, name}) => ({name, color}))

    const pieceImages: HTMLImageElement[] = useMemo(() => {
        const images = [];
        for (let i = 0; i < pieces.length; i++) {
            const image = new Image();
            image.src = pieces[i].src;
            images.push(image)
        }
        return images
    }, [pieces]);

    const [positions, setPositions] = useState(pieces
        .map(({x,y, isAlive}) => ({x, y, isAlive})));

    const [coloredSquares, setColoredSquares] = useState<{x: number, y: number}[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.style.cursor = "grabbing";
        window.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseUp);
        draw_pieces(ctx);
        
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
        const index = getIndexAtPosition(mousePositions.x, mousePositions.y);
        if (index !== -1) {
            draggingIndex = index
            mousePosition = {x: mousePositions.x, y: mousePositions.y};
            //adjustPiecePosition()
        }
    }

    const onMouseUp = () => {
        adjustPiecePosition();
        //setColoredSquares([])
        draggingIndex = -1;
    }

    const handleMouseMove = (event: MouseEvent) => {
        let {x, y} = getMousePositions(event)
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

    const adjustPiecePosition = () => {
        let nextSquare = squareSize;
        const pieceImageShift = (squareSize - imageSize) / 2;
        let {x, y} = mousePosition
        let positionsToColor: { x: number, y: number }[] = []

        for (let square = 0; square !== canvasSize; square += squareSize) {
            if (x >= square && x <= nextSquare) x = square + pieceImageShift;
            if (y < nextSquare && y >= square) y = square + pieceImageShift;
            nextSquare += squareSize;
        }

        if (draggingIndex !== -1 && pieces[draggingIndex].isAlive) {
            const currX = positions[draggingIndex].x;
            const currY = positions[draggingIndex].y;
            let killedPiecePosition = {x: -100, y: -100}

            const resetPosition = () => {
                x = currX;
                y = currY;
            }

            const killPieces = (pos: {x:number, y:number}) => {
                const index = getIndexAtPosition(pos.x, pos.y)
                if (isPieceOnSquare(pos.x, pos.y) && color_name_arr[index] &&
                    color_name_arr[index].color !== color_name_arr[draggingIndex].color) {
                    pieces[index].isAlive = false
                }
                return index
            }

            //check if piece is moved in valid position
            const checkIfValid = (validMoves: Moves[]) => {
                let isValidMove = false;
                for (let index = 0; index < validMoves.length; index++) {
                    if (x === validMoves[index].x && y === validMoves[index].y) isValidMove = true
                    if (isValidMove) {
                        killedPiecePosition = {x: validMoves[index].x, y: validMoves[index].y}
                        break
                    }
                }
                positionsToColor = validMoves
                return isValidMove
            }

            // check if position where the king or the knight can move isn't blocked by same colored piece
            const correctMoves = (Moves: Moves[]) => {
                let validMoves: Moves[] = []
                for (let i = 0; i < Moves.length; i++){
                    if (color_name_arr[Moves[i].index]) {
                        const sameColors = color_name_arr[Moves[i].index].color === color_name_arr[draggingIndex].color
                        if (isPieceOnSquare(Moves[i].x, Moves[i].y) && !sameColors){
                            validMoves.push({x: Moves[i].x, y: Moves[i].y, index: Moves[i].index})
                        }
                    } else validMoves.push({x: Moves[i].x, y: Moves[i].y, index: Moves[i].index})
                }
                return validMoves
            }

            if (color_name_arr[draggingIndex].name === "pawn"){
                const white = color_name_arr[draggingIndex].color === "white"
                //find in between which x positions the dragging pawn is
                let posXStart = currX - pieceImageShift
                let posXEnd = currX + (squareSize - pieceImageShift)

                //find maximum y positions where pawn can move
                let posYStart, posYEnd;
                if (white) {
                    posYStart = currY - (squareSize + pieceImageShift)
                    posYEnd = currY - pieceImageShift
                } else {
                    posYStart = currY + squareSize - pieceImageShift
                    posYEnd = currY + (2 * squareSize) - pieceImageShift
                }

                const topLeft = {
                    x: currX - squareSize,
                    y: white ? currY - squareSize : currY + squareSize
                }
                const topLeftIndex = getIndexAtPosition(topLeft.x, topLeft.y)

                const topRight = {
                    x: currX + squareSize,
                    y: white ? currY - squareSize : currY + squareSize
                }
                const topRightIndex = getIndexAtPosition(topRight.x, topRight.y)

                const inFront = {
                    x: currX,
                    y: white ? currY - squareSize : currY + squareSize
                }

                if (isPieceOnSquare(topLeft.x, topLeft.y) &&
                color_name_arr[topLeftIndex].color !== color_name_arr[draggingIndex].color){
                    positionsToColor.push({x: topLeft.x, y: topLeft.y})
                    posXStart -= squareSize;
                }
                if (isPieceOnSquare(topRight.x, topRight.y) &&
                    color_name_arr[topRightIndex].color !== color_name_arr[draggingIndex].color){
                    positionsToColor.push({x: topRight.x, y: topRight.y})
                    posXEnd += squareSize;
                }

                if (!isPieceOnSquare(inFront.x, inFront.y)){
                    positionsToColor.push({x: inFront.x, y: inFront.y})
                }

                //if pawn has not moved yet, give it an ability to move two squares in front
                const whitePawnInitialPositionY = canvasSize - 2 * squareSize
                if (white && currY >= whitePawnInitialPositionY && !isPieceOnSquare(inFront.x, inFront.y)
                    && !isPieceOnSquare(inFront.x, inFront.y - squareSize)){
                    positionsToColor.push({x: inFront.x, y: inFront.y - squareSize})
                    posYStart -= squareSize
                }
                const blackPawnInitialPositionY = 2 * squareSize
                if (!white && currY <= blackPawnInitialPositionY && !isPieceOnSquare(inFront.x, inFront.y)
                    && !isPieceOnSquare(inFront.x, inFront.y + squareSize)){
                    positionsToColor.push({x: inFront.x, y: inFront.y + squareSize})
                    posYEnd += squareSize
                }

                if (isPieceOnSquare(inFront.x, inFront.y) &&
                    (inFront.x <= x && x <= inFront.x + squareSize - pieceImageShift)){
                    resetPosition()
                }
                if ((posXStart >= x || x >= posXEnd) || (posYEnd <= y || y <= posYStart)){
                    resetPosition()
                } else {
                    if (x === topLeft.x && y === topLeft.y) {
                        killedPiecePosition = {x: topLeft.x, y: topLeft.y}
                    }
                    if (x === topRight.x && y === topRight.y) {
                        killedPiecePosition = {x: topRight.x, y: topRight.y}
                    }
                }
            }

            const getValidMovesForRookAndBishop = (dx: number, dy: number) => {
                let validMoves: Moves[] = [];

                for (let square = squareSize; square < canvasSize; square += squareSize) {
                    const x = currX + square * dx;
                    const y = currY + square * dy;
                    const index = getIndexAtPosition(x, y);

                    if (color_name_arr[index]) {
                        const sameColors = color_name_arr[index].color === color_name_arr[draggingIndex].color;
                        if (isPieceOnSquare(x, y) && sameColors) break;
                        else if (isPieceOnSquare(x, y) && !sameColors) {
                            validMoves.push({ x, y, index });
                            break;
                        }
                    }
                    validMoves.push({ x, y, index });
                }
                return validMoves;
            }

            const rookValidMoves = () => {
                let validMoves: Moves[] = [];

                validMoves = validMoves.concat(getValidMovesForRookAndBishop(-1, 0));
                validMoves = validMoves.concat(getValidMovesForRookAndBishop(1, 0));
                validMoves = validMoves.concat(getValidMovesForRookAndBishop(0, -1));
                validMoves = validMoves.concat(getValidMovesForRookAndBishop(0, 1));

                return validMoves;
            }

            const knightValidMoves = () => {
                //Get all the coordinates where the knight can move
                const upLeft = {x: currX - squareSize, y: currY + 2 * squareSize,
                    index: getIndexAtPosition(currX - squareSize, currY + 2 * squareSize)}

                const upRight = {x: currX + squareSize, y: currY + 2 * squareSize,
                    index: getIndexAtPosition(currX + squareSize, currY + 2 * squareSize)}

                const leftUp = {x: currX - 2 * squareSize, y: currY + squareSize,
                    index: getIndexAtPosition(currX - 2 * squareSize, currY + squareSize)}

                const leftDown = {x: currX - 2 * squareSize, y: currY - squareSize,
                    index: getIndexAtPosition(currX - 2 * squareSize, currY - squareSize)}

                const downLeft = {x: currX - squareSize, y: currY - 2 * squareSize,
                    index: getIndexAtPosition(currX - squareSize, currY - 2 * squareSize)}

                const downRight = {x: currX + squareSize, y: currY - 2 * squareSize,
                    index: getIndexAtPosition(currX + squareSize, currY - 2 * squareSize)}

                const rightDown = {x: currX + 2 * squareSize, y: currY - squareSize,
                    index: getIndexAtPosition(currX + 2 * squareSize, currY - squareSize)}

                const rightUp = {x: currX + 2 * squareSize, y: currY + squareSize,
                    index: getIndexAtPosition(currX + 2 * squareSize, currY + squareSize,)}

                const Moves = [upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp]

                positionsToColor = correctMoves(Moves)
                return correctMoves(Moves)
            }

            const bishopValidMoves = () => {
                let validMoves: Moves[] = [];

                validMoves = validMoves.concat(getValidMovesForRookAndBishop(1, 1));
                validMoves = validMoves.concat(getValidMovesForRookAndBishop(1, -1));
                validMoves = validMoves.concat(getValidMovesForRookAndBishop(-1, 1));
                validMoves = validMoves.concat(getValidMovesForRookAndBishop(-1, -1));

                return validMoves;
            }

            const kingValidMoves = () => {
                //Get all the coordinates where the king can move
                const left = {
                    x: currX - squareSize, y: currY,
                    index: getIndexAtPosition(currX - squareSize, currY)
                }
                const right = {
                    x: currX + squareSize, y: currY,
                    index: getIndexAtPosition(currX + squareSize, currY)
                }
                const down = {
                    x: currX, y: currY - squareSize,
                    index: getIndexAtPosition(currX, currY - squareSize)
                }
                const up = {
                    x: currX, y: currY + squareSize,
                    index: getIndexAtPosition(currX, currY + squareSize)
                }
                const downLeft = {
                    x: currX - squareSize, y: currY - squareSize,
                    index: getIndexAtPosition(currX - squareSize, currY - squareSize)
                }
                const downRight = {
                    x: currX + squareSize, y: currY - squareSize,
                    index: getIndexAtPosition(currX + squareSize, currY - squareSize)
                }
                const upLeft = {
                    x: currX - squareSize, y: currY + squareSize,
                    index: getIndexAtPosition(currX - squareSize, currY + squareSize)
                }
                const upRight = {
                    x: currX + squareSize, y: currY + squareSize,
                    index: getIndexAtPosition(currX + squareSize, currY + squareSize)
                }
                const Moves = [left, right, down, up, downLeft, downRight, upLeft, upRight]

                positionsToColor = correctMoves(Moves)
                return correctMoves(Moves)
            }

            if (color_name_arr[draggingIndex].name === "rook"){
                if (!checkIfValid(rookValidMoves())) resetPosition()
            }

            if (color_name_arr[draggingIndex].name === "knight"){
                if (!checkIfValid(knightValidMoves())) resetPosition()
            }

            if (color_name_arr[draggingIndex].name === "bishop") {
                if (!checkIfValid(bishopValidMoves())) resetPosition()
            }

            if (color_name_arr[draggingIndex].name === "queen") {
                if (!checkIfValid([...rookValidMoves(), ...bishopValidMoves()])) resetPosition()
            }

            if (color_name_arr[draggingIndex].name === "king") {
                if (!checkIfValid(kingValidMoves())) resetPosition()
            }

            const killedPieceIndex = killPieces(killedPiecePosition)

            const piecePositions = [...positions]
            piecePositions[draggingIndex] = {x: x, y: y, isAlive: true}
            if (killedPieceIndex !== -1) piecePositions[killedPieceIndex] = {x: -100, y: -100, isAlive: false}
            setPositions(piecePositions)
            setColoredSquares(positionsToColor)
        }
    }

    function isPieceOnSquare(x: number, y: number) {
        return positions.some(pos => pos.x === x && pos.y === y);
    }

    const getIndexAtPosition = (x: number, y: number) => {
        for (let i = 0; i < positions.length; i++) {
            const { x: imageX, y: imageY } = positions[i];
            if (x >= imageX && x <= imageX + imageSize && y >= imageY && y <= imageY + imageSize) return i;
        }
        return -1;
    }

    const draw_pieces = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        //Draw background
        if (ctx) {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const x = col * squareSize;
                    const y = row * squareSize;
                    ctx.fillStyle = (row + col) % 2 === 0 ? "#FFFFFF" : '#000000'
                    ctx.fillRect(x, y, squareSize, squareSize);
                }
            }
        }
        //Draw pieces
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].isAlive) {
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
        for (let pos of coloredSquares) {
            ctx.beginPath();
            ctx.arc(pos.x+25, pos.y+25, squareSize / 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#abf6d0'
            ctx.fill();
        }
        requestAnimationFrame(() => draw_pieces(ctx));
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