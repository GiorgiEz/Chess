import React, {useEffect, useState} from "react";
import "./ChessBoard.css"

interface Props {
    pieces: {src: string, x: number, y:number, color: "white" | "black", name: string, isAlive: boolean}[];
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
    const pieceImages: HTMLImageElement[] = []
    const color_name_array = pieces.map(({color, name, isAlive}) => ({name, color, isAlive}))

    for (let i = 0; i < pieces.length; i++) {
        const image = new Image();
        image.src = pieces[i].src;
        pieceImages.push(image)
    }
    const [positions, setPositions] = useState(pieces.map(({x,y, isAlive}) => ({x, y, isAlive})));

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
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

    const onMouseMove = (event: MouseEvent) => {
        mousePosition = getMousePositions(event);
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

                if (isPieceOnSquare(topLeft.x, topLeft.y) &&
                color_name_array[topLeftIndex].color !== color_name_array[i].color) {
                    posXStart -= squareSize;
                }
                if (isPieceOnSquare(topRight.x, topRight.y) &&
                    color_name_array[topRightIndex].color !== color_name_array[i].color) {
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

            const rookValidMoves = () => {
                const validMoves: Moves[] = []
                //down
                for (let square = squareSize; square < canvasSize; square += squareSize){
                    const index = getIndexAtPosition(currX, currY - square)
                    validMoves.push({x: currX, y: currY - square, index: index })
                }
                //up
                for (let square = squareSize; square < canvasSize; square += squareSize){
                    const index = getIndexAtPosition(currX, currY + square)
                    validMoves.push({x: currX, y: currY + square, index})
                }
                //left
                for (let square = squareSize; square < canvasSize; square += squareSize){
                    const index = getIndexAtPosition(currX - square, currY)
                    validMoves.push({x: currX - square, y: currY, index})
                }
                //right
                for (let square = squareSize; square < canvasSize; square += squareSize){
                    const index = getIndexAtPosition(currX + square, currY)
                    validMoves.push({x: currX + square, y: currY, index})
                }
                return validMoves
            }

            if (color_name_array[i].name === "rook") {
                const validMoves: Moves[] = rookValidMoves()
                let isValidMove = false;
                for (let index = 0; index < validMoves.length; index++) {
                    if (x === validMoves[index].x && y === validMoves[index].y &&
                        color_name_array[validMoves[index].index] &&
                        color_name_array[validMoves[index].index].color === color_name_array[i].color) {
                        // Cannot capture its own pieces
                        isValidMove = false;
                    }
                    else if (x === validMoves[index].x && y === validMoves[index].y) {
                        // check if there is any piece on the rook's path to the target square
                        if (currX === x) {
                            // check vertical movement
                            const stepY = validMoves[index].y - currY > 0 ? squareSize : -squareSize;
                            let pathY = currY + stepY;
                            let blocked = false;
                            while (pathY !== validMoves[index].y) {
                                if (isPieceOnSquare(currX, pathY)) {
                                    blocked = true;
                                    break;
                                }
                                pathY += stepY;
                            }
                            isValidMove = !blocked;
                        } else if (currY === y) {
                            // check horizontal movement
                            const stepX = validMoves[index].x - currX > 0 ? squareSize : -squareSize;
                            let pathX = currX + stepX;
                            let blocked = false;
                            while (pathX !== validMoves[index].x) {
                                if (isPieceOnSquare(pathX, currY)) {
                                    blocked = true;
                                    break;
                                }
                                pathX += stepX;
                            }
                            isValidMove = !blocked;
                        }
                    }
                    if (isValidMove) break;
                }
                if (!isValidMove){
                    x = currX
                    y = currY
                }
            }

            if (color_name_array[i].name === "knight") {
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

                const validMoves = [upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp]

                if (!isValidMove_king_knight(validMoves, x, y, i)){ x = currX; y = currY }
            }

            const bishopValidMoves = () => {
                const validMoves: Moves[] = []
                //right-down
                for (let square = squareSize; square < canvasSize; square += squareSize){
                    const index = getIndexAtPosition(currX + square, currY - square)
                    validMoves.push({x: currX + square, y: currY - square, index: index })
                }
                //right-up
                for (let square = squareSize; square < canvasSize; square += squareSize){
                    const index = getIndexAtPosition(currX + square, currY + square)
                    validMoves.push({x: currX + square, y: currY + square, index})
                }
                //left-up
                for (let square = squareSize; square < canvasSize; square += squareSize){
                    const index = getIndexAtPosition(currX - square, currY + square)
                    validMoves.push({x: currX - square, y: currY + square, index})
                }
                //left-down
                for (let square = squareSize; square < canvasSize; square += squareSize){
                    const index = getIndexAtPosition(currX - square, currY - square)
                    validMoves.push({x: currX - square, y: currY - square, index})
                }
                return validMoves
            }

            if (color_name_array[i].name === "bishop") {
                const validMoves: Moves[] = bishopValidMoves()

                let isValidMove = false;
                for (let index = 0; index < validMoves.length; index++) {
                    if (x === validMoves[index].x && y === validMoves[index].y &&
                        color_name_array[validMoves[index].index] &&
                        color_name_array[validMoves[index].index].color === color_name_array[i].color) {
                        // Cannot capture its own pieces
                        isValidMove = false;
                    }
                    else if (x === validMoves[index].x && y === validMoves[index].y) {
                        // check if there is any piece on the bishop's path to the target square
                        const stepX = validMoves[index].x - currX > 0 ? squareSize : -squareSize;
                        const stepY = validMoves[index].y - currY > 0 ? squareSize : -squareSize;
                        let pathX = currX + stepX;
                        let pathY = currY + stepY;
                        let blocked = false;
                        while (pathX !== validMoves[index].x && pathY !== validMoves[index].y) {
                            if (isPieceOnSquare(pathX, pathY)) {
                                blocked = true;
                                break;
                            }
                            pathX += stepX;
                            pathY += stepY;
                        }
                        isValidMove = !blocked;
                    }
                    if (isValidMove) break;
                }
                if (!isValidMove){ x = currX; y = currY }
            }

            if (color_name_array[i].name === "queen") {
                const validMoves: Moves[] = [...rookValidMoves(), ...bishopValidMoves()]

                let isValidMove = false;
                for (let index = 0; index < validMoves.length; index++) {
                    if (x === validMoves[index].x && y === validMoves[index].y &&
                        color_name_array[validMoves[index].index] &&
                        color_name_array[validMoves[index].index].color === color_name_array[i].color) {
                        // Cannot capture its own pieces
                        isValidMove = false;
                    }
                    else if (x === validMoves[index].x && y === validMoves[index].y) {
                        // check if there is any piece on the rook's path to the target square
                        if (currX === x) {
                            // check vertical movement
                            const stepY = validMoves[index].y - currY > 0 ? squareSize : -squareSize;
                            let pathY = currY + stepY;
                            let blocked = false;
                            while (pathY !== validMoves[index].y) {
                                if (isPieceOnSquare(currX, pathY)) {
                                    blocked = true;
                                    break;
                                }
                                pathY += stepY;
                            }
                            isValidMove = !blocked;
                        } else if (currY === y) {
                            // check horizontal movement
                            const stepX = validMoves[index].x - currX > 0 ? squareSize : -squareSize;
                            let pathX = currX + stepX;
                            let blocked = false;
                            while (pathX !== validMoves[index].x) {
                                if (isPieceOnSquare(pathX, currY)) {
                                    blocked = true;
                                    break;
                                }
                                pathX += stepX;
                            }
                            isValidMove = !blocked;
                        } else {
                            // check diagonal movement
                            const stepX = validMoves[index].x - currX > 0 ? squareSize : -squareSize;
                            const stepY = validMoves[index].y - currY > 0 ? squareSize : -squareSize;
                            let pathX = currX + stepX;
                            let pathY = currY + stepY;
                            let blocked = false;
                            while (pathX !== validMoves[index].x && pathY !== validMoves[index].y) {
                                if (isPieceOnSquare(pathX, pathY)) {
                                    blocked = true;
                                    break;
                                }
                                pathX += stepX;
                                pathY += stepY;
                            }
                            isValidMove = !blocked;
                        }
                    }
                    if (isValidMove) break;
                }
                if (!isValidMove){ x = currX; y = currY }
            }

            if (color_name_array[i].name === "king") {
                //Get all the coordinates where the king can move
                const left = {x: currX - squareSize, y: currY,
                    index: getIndexAtPosition(currX - squareSize, currY)}

                const right = {x: currX + squareSize, y: currY,
                    index: getIndexAtPosition(currX + squareSize, currY)}

                const down = {x: currX, y: currY - squareSize,
                    index: getIndexAtPosition(currX, currY - squareSize)}

                const up = {x: currX, y: currY + squareSize,
                    index: getIndexAtPosition(currX, currY + squareSize)}

                const downLeft = {x: currX - squareSize, y: currY - squareSize,
                    index: getIndexAtPosition(currX - squareSize, currY- squareSize)}

                const downRight = {x: currX + squareSize, y: currY - squareSize,
                    index: getIndexAtPosition(currX + squareSize, currY - squareSize)}

                const upLeft = {x: currX - squareSize, y: currY + squareSize,
                    index: getIndexAtPosition(currX - squareSize, currY + squareSize)}

                const upRight = {x: currX + squareSize, y: currY + squareSize,
                    index: getIndexAtPosition(currX + squareSize, currY + squareSize)}

                const validMoves = [left, right, down, up, downLeft, downRight, upLeft, upRight]

                if (!isValidMove_king_knight(validMoves, x, y, i)) { x = currX; y = currY }
            }
        }
        const pos = [...positions];
        pos[i] = { x: x, y: y, isAlive: true};
        setPositions(pos)
    }

    //check if the move is valid for the king and the knight
    function isValidMove_king_knight(validMoves: Moves[], x: number, y: number, i: number): boolean{
        let validMove = false
        for (let index = 0; index < validMoves.length; index++){
            if (x === validMoves[index].x && y === validMoves[index].y &&
                isPieceOnSquare(validMoves[index].x, validMoves[index].y) &&
                color_name_array[validMoves[index].index].color === color_name_array[i].color){
                validMove = false
            }
            else if (x === validMoves[index].x && y === validMoves[index].y) {
                validMove = true
                break
            }
        }
        return validMove
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
                    ctx.fillStyle = (row + col) % 2 === 0 ? "#FFFFFF" : '#000000';
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