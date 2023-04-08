import React, {useEffect, useState} from "react";
import "./ChessBoard.css"

interface Props {
    pieces: {src: string, x: number, y:number, color: "white" | "black", name: string}[];
}

export const MovePieces: React.FC<Props> = ({pieces}) => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    const squareSize = 75;
    const canvasSize = 600;
    const imageSize = 50;
    const pieceImages: HTMLImageElement[] = []
    let draggingIndex: number = -1
    let mousePosition = {x: 0, y: 0}
    const color_name_array = pieces.map(({color, name}) => ({name, color}))

    for (let i = 0; i < pieces.length; i++) {
        const image = new Image();
        image.src = pieces[i].src;
        pieceImages.push(image)
    }
    
    const [positions, setPositions] = useState(pieces.map(({x,y}) => ({x, y})))
    
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        window.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseUp);
        draw_pieces(ctx);
        
        return (() =>{
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
        }
    }

    const onMouseUp = () => {
        adjustPiecePosition()
        draggingIndex = -1
    }

    const handleMouseMove = (event: MouseEvent) => {
        const mousePositions = getMousePositions(event)
        let x = mousePositions.x
        let y = mousePositions.y
        //Can't move pieces outside of canvas
        const border = canvasSize - imageSize
        if (x >= border) x = border
        if (x <= 0) x = 0
        if (y <= 0) y = 0
        if (y >= border) y = border
        mousePosition = { x: x, y: y };
    }

    function isPieceOnSquare(x: number, y: number) {
        return positions.some(pos => pos.x === x && pos.y === y);
    }

    const adjustPiecePosition = () => {
        let nextSquare = squareSize;
        const pieceImageShift = (squareSize - imageSize) / 2;
        let x = mousePosition.x
        let y = mousePosition.y
        const i = draggingIndex

        for (let square = 0; square !== squareSize * 8; square += squareSize) {
            if (x >= square && x <= nextSquare) x = square + pieceImageShift;
            if (y < nextSquare && y >= square) y = square + pieceImageShift;
            nextSquare += squareSize;
        }

        if (i !== -1) {
            const currX = positions[i].x;
            const currY = positions[i].y;

            if (color_name_array[i].name === "pawn") {
                const white = color_name_array[i].color === "white"
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

                if (white && isPieceOnSquare(topLeft.x, topLeft.y) &&
                    color_name_array[topLeftIndex].color === "black") {
                    posXStart -= squareSize;
                }
                if (white && isPieceOnSquare(topRight.x, topRight.y) &&
                    color_name_array[topRightIndex].color === "black") {
                    posXEnd += squareSize;
                }
                if (!white && isPieceOnSquare(topLeft.x, topLeft.y) &&
                    color_name_array[topLeftIndex].color === "white") {
                    posXStart -= squareSize;
                }
                if (!white && isPieceOnSquare(topRight.x, topRight.y) &&
                    color_name_array[topRightIndex].color === "white") {
                    posXEnd += squareSize;
                }

                //if pawn has not moved yet, give it an ability to move two squares in front
                if (white && currY >= canvasSize - 2 * squareSize &&
                    !isPieceOnSquare(inFront.x, inFront.y - squareSize)) {
                    posYStart -= squareSize
                }
                if (!white && currY <= 2 * squareSize &&
                    !isPieceOnSquare(inFront.x, inFront.y + squareSize)) {
                    posYEnd += squareSize
                }
                if (isPieceOnSquare(inFront.x, inFront.y) &&
                    (inFront.x <= x && x <= inFront.x + squareSize - pieceImageShift)){
                    x = currX;
                    y = currY;
                }

                if ((posXStart >= x || x >= posXEnd) || (posYEnd <= y || y <= posYStart)){
                    x = currX;
                    y = currY;
                }
            }

            if (color_name_array[i].name === "rook") {
                // Check if the rook is being moved horizontally or vertically
                const isHorizontalMove = (x !== currX && y === currY);
                const isVerticalMove = (x === currX && y !== currY);

                if (isHorizontalMove) {
                    const minX = Math.min(currX, x);
                    const maxX = Math.max(currX, x);
                    console.log(`x:${currX} y:${currY} ==> x:${x} y:${y}`);
                    for (let posX = minX + squareSize; posX < maxX; posX += squareSize) {
                        const blockingPieceIndex = getIndexAtPosition(posX, y)
                        if (isPieceOnSquare(posX, y) &&
                            color_name_array[i].color !== color_name_array[blockingPieceIndex].color) {
                            console.log(`Blocking piece: x:${posX} y:${y}`);
                            x = currX
                            break
                        } else if (isPieceOnSquare(posX, y)){
                            x = currX
                            //
                        }
                    }
                }
                else if (isVerticalMove) {
                    // Check if there are any pieces blocking the vertical path
                    const minY = Math.min(currY, y);
                    const maxY = Math.max(currY, y);
                    for (let posY = minY + squareSize; posY < maxY; posY += squareSize) {
                        if (isPieceOnSquare(x, posY)) {
                            console.log(`Blocking piece: x:${x} y:${posY}`);
                            y = currY;
                            break;
                        }
                    }
                } else {
                    // Invalid move, reset position
                    x = currX;
                    y = currY;
                }
            }

            if (color_name_array[i].name === "knight") {
                //Get all the coordinates where the knight can move
                const upLeft = {x: currX - squareSize, y: currY + 2 * squareSize}
                const upLeftIndex = getIndexAtPosition(upLeft.x, upLeft.y)

                const upRight = {x: currX + squareSize, y: currY + 2 * squareSize}
                const upRightIndex = getIndexAtPosition(upRight.x, upRight.y)

                const leftUp = {x: currX - 2 * squareSize, y: currY + squareSize}
                const leftUpIndex = getIndexAtPosition(leftUp.x, leftUp.y)

                const leftDown = {x: currX - 2 * squareSize, y: currY - squareSize}
                const leftDownIndex = getIndexAtPosition(leftDown.x, leftDown.y)

                const downLeft = {x: currX - squareSize, y: currY - 2 * squareSize}
                const downLeftIndex = getIndexAtPosition(downLeft.x, downLeft.y)

                const downRight = {x: currX + squareSize, y: currY - 2 * squareSize}
                const downRightIndex = getIndexAtPosition(downRight.x, downRight.y)

                const rightDown = {x: currX + 2 * squareSize, y: currY - squareSize}
                const rightDownIndex = getIndexAtPosition(rightDown.x, rightDown.y)

                const rightUp = {x: currX + 2 * squareSize, y: currY + squareSize}
                const rightUpIndex = getIndexAtPosition(rightUp.x, rightUp.y)

                const posIndices = [upLeftIndex, upRightIndex, leftUpIndex, leftDownIndex,
                                downLeftIndex, downRightIndex, rightDownIndex, rightUpIndex]

                const piecePos = [upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp]

                let validMove = false
                for (let index = 0; index < posIndices.length; index++){
                    if (x === piecePos[index].x && y === piecePos[index].y &&
                        isPieceOnSquare(piecePos[index].x, piecePos[index].y) &&
                        color_name_array[posIndices[index]].color === color_name_array[i].color){
                        validMove = false
                    }
                    else if (x === piecePos[index].x && y === piecePos[index].y) validMove = true
                }
                if (!validMove){
                    x = currX
                    y = currY
                }
            }
        }

        const pos = [...positions];
        pos[i] = { x: x, y: y };
        setPositions(pos)
    }

    const onMouseMove = (event: MouseEvent) => {
        mousePosition = getMousePositions(event);
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
                    ctx.fillStyle = (row + col) % 2 === 0 ? "#FFFFFF" : '#000000';
                    ctx.fillRect(x, y, squareSize, squareSize);
                }
            }
        }
        //Draw pieces
        for (let i = 0; i < pieces.length; i++) {
            const image = pieceImages[i];
            let { x, y } = positions[i];

            // If the piece is being dragged, draw it at the current mouse position
            if (i === draggingIndex) {
                x = mousePosition.x;
                y = mousePosition.y;
            }
            ctx.drawImage(image, x, y, imageSize, imageSize);
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