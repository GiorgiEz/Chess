import React, {useEffect, useMemo, useState} from "react";
import "./ChessBoard.css"
import {Piece} from "./ChessBoard";

interface Props {
    pieces: Piece[];
}

type Moves = {
    x: number,
    y: number,
    index: number,
}

type Pieces = {
    x: number,
    y: number,
    isAlive: boolean,
}

export type Positions = Omit<Moves, 'index'>;

export const MovePieces: React.FC<Props> = ({pieces}) => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    const squareSize = 75;
    const canvasSize = 600;
    const imageSize = 50;
    let draggingIndex: number = -1
    let mousePosition = {x: 0, y: 0}
    let greenSquares: Positions[] = []
    let redSquares: Positions[] = []
    let redSquaresPawn: Positions[] = []
    let killedPiecePosition = {x: -100, y: -100}
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

    const white_king_index = 19
    const white_king = {x: positions[white_king_index].x, y: positions[white_king_index].y}

    const black_king_index = 16
    const black_king = {x: positions[black_king_index].x, y: positions[black_king_index].y}

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
        const index = getIndexAtPosition(mousePositions.x, mousePositions.y, positions);
        if (index !== -1) {
            draggingIndex = index
            mousePosition = {x: mousePositions.x, y: mousePositions.y};
            colorSquares()
        }
    }

    const onMouseUp = () => {
        movePieces()
        draggingIndex = -1;
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

    const killPieces = (pos: Positions) => {
        const index = getIndexAtPosition(pos.x, pos.y, positions)
        if (isPieceOnSquare(pos.x, pos.y, positions) && color_name_arr[index] &&
            color_name_arr[index].color !== color_name_arr[draggingIndex].color) {
            pieces[index].isAlive = false
        }
        return index
    }

    const adjustPiecePositions = () => {
        let {x, y} = mousePosition
        let nextSquare = squareSize;
        const pieceImageShift = (squareSize - imageSize) / 2;
        for (let square = 0; square !== canvasSize; square += squareSize) {
            if (x >= square && x <= nextSquare) x = square + pieceImageShift;
            if (y < nextSquare && y >= square) y = square + pieceImageShift;
            nextSquare += squareSize;
        }
        return {x, y}
    }

    const getCurrentPosition = () => {
        let currX = 0
        let currY = 0
        if (draggingIndex !== -1) {
            currX = positions[draggingIndex].x;
            currY = positions[draggingIndex].y;
            return {currX, currY}
        }
        return {currX, currY}
    }

    function isPieceOnSquare(x: number, y: number, board: Positions[]) {
        return board.some(pos => pos.x === x && pos.y === y);
    }

    const getIndexAtPosition = (x: number, y: number, board: Pieces[]) => {
        for (let i = 0; i < board.length; i++) {
            const { x: imageX, y: imageY } = board[i];
            if (x >= imageX && x <= imageX + imageSize && y >= imageY && y <= imageY + imageSize) return i;
        }
        return -1;
    }

    //check if piece is moved in valid position
    const checkIfValid = (validMoves: Moves[]) => {
        let {x, y} = adjustPiecePositions()
        let isValidMove = false;
        for (let index = 0; index < validMoves.length; index++) {
            if (x === validMoves[index].x && y === validMoves[index].y) isValidMove = true
            if (isValidMove) {
                killedPiecePosition = {x: validMoves[index].x, y: validMoves[index].y}
                break
            }
        }
        greenSquares = validMoves
        return isValidMove
    }

    // check if position where the king or the knight can move isn't blocked by same colored piece
    const correctMoves = (Moves: Moves[], board: Pieces[]) => {
        let validMoves: Moves[] = []
        for (let i = 0; i < Moves.length; i++){
            const move = {x: Moves[i].x, y: Moves[i].y, index: Moves[i].index}
            if (move.x >= 0 && move.x <= canvasSize && move.y >= 0 && move.y <= canvasSize) {
                if (color_name_arr[move.index]) {
                    const sameColors = color_name_arr[move.index].color === color_name_arr[draggingIndex].color
                    if (isPieceOnSquare(move.x, move.y, board) && !sameColors) {
                        redSquares.push({x: move.x, y: move.y})
                        validMoves.push(move)
                    }
                } else validMoves.push(move)
            }
        }
        return validMoves
    }

    const pawnPossibleMoves = (currX: number, currY: number, index: number) => {
        const white = color_name_arr[index].color === "white"
        const topLeft = {
            x: currX - squareSize,
            y: white ? currY - squareSize : currY + squareSize
        }
        const topRight = {
            x: currX + squareSize,
            y: white ? currY - squareSize : currY + squareSize
        }
        const inFront = {
            x: currX,
            y: white ? currY - squareSize : currY + squareSize
        }
        const topLeftIndex = getIndexAtPosition(topLeft.x, topLeft.y, positions)
        const topRightIndex = getIndexAtPosition(topRight.x, topRight.y, positions)
        return {topLeft, topRight, inFront, topLeftIndex, topRightIndex}
    }

    const getValidMovesForRookOrBishop = (
        dx: number, dy: number, currX: number, currY: number, dragIndex: number, board: Pieces[]
    ) => {
        let validMoves: Moves[] = [];
        for (let square = squareSize; square < canvasSize; square += squareSize) {
            const x = currX + square * dx;
            const y = currY + square * dy;
            const index = getIndexAtPosition(x, y, board);

            if (x >= 0 && x <= canvasSize && y >= 0 && y <= canvasSize) {
                if (color_name_arr[index] && color_name_arr[dragIndex]) {
                    const sameColors = color_name_arr[index].color === color_name_arr[dragIndex].color;
                    if (isPieceOnSquare(x, y, board) && sameColors) break;
                    else if (isPieceOnSquare(x, y, board) && !sameColors) {
                        validMoves.push({x, y, index});
                        break;
                    }
                }
                validMoves.push({x, y, index});
            }
        }
        return validMoves;
    }

    const rookValidMoves = (currX: number, currY: number, index: number, board: Pieces[]) => {
        let validMoves: Moves[] = [];

        validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, 0, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, 0, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(0, -1, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(0, 1, currX, currY, index, board));
        return validMoves
    }

    const bishopValidMoves = (currX: number, currY: number, index: number, board: Pieces[]) => {
        let validMoves: Moves[] = [];

        validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, 1, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, -1, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, 1, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, -1, currX, currY, index, board));

        return validMoves
    }

    const knightValidMoves = (currX: number, currY: number, index: number, board: Pieces[]) => {
        //Get all the coordinates where the knight can move
        const upLeft = {x: currX - squareSize, y: currY + 2 * squareSize,
            index: getIndexAtPosition(currX - squareSize, currY + 2 * squareSize, board)}

        const upRight = {x: currX + squareSize, y: currY + 2 * squareSize,
            index: getIndexAtPosition(currX + squareSize, currY + 2 * squareSize, board)}

        const leftUp = {x: currX - 2 * squareSize, y: currY + squareSize,
            index: getIndexAtPosition(currX - 2 * squareSize, currY + squareSize, board)}

        const leftDown = {x: currX - 2 * squareSize, y: currY - squareSize,
            index: getIndexAtPosition(currX - 2 * squareSize, currY - squareSize, board)}

        const downLeft = {x: currX - squareSize, y: currY - 2 * squareSize,
            index: getIndexAtPosition(currX - squareSize, currY - 2 * squareSize, board)}

        const downRight = {x: currX + squareSize, y: currY - 2 * squareSize,
            index: getIndexAtPosition(currX + squareSize, currY - 2 * squareSize, board)}

        const rightDown = {x: currX + 2 * squareSize, y: currY - squareSize,
            index: getIndexAtPosition(currX + 2 * squareSize, currY - squareSize, board)}

        const rightUp = {x: currX + 2 * squareSize, y: currY + squareSize,
            index: getIndexAtPosition(currX + 2 * squareSize, currY + squareSize, board)}

        return correctMoves([upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp], board)
    }

    const queenValidMoves = (currX: number, currY: number, index: number, board: Pieces[]) => {
        return [...rookValidMoves(currX, currY, index, board), ...bishopValidMoves(currX, currY, index, board)]
    }

    const kingValidMoves = (currX: number, currY: number, board: Pieces[]) => {
        //Get all the coordinates where the king can move
        const left = {
            x: currX - squareSize, y: currY,
            index: getIndexAtPosition(currX - squareSize, currY, board)
        }
        const right = {
            x: currX + squareSize, y: currY,
            index: getIndexAtPosition(currX + squareSize, currY, board)
        }
        const down = {
            x: currX, y: currY - squareSize,
            index: getIndexAtPosition(currX, currY - squareSize, board)
        }
        const up = {
            x: currX, y: currY + squareSize,
            index: getIndexAtPosition(currX, currY + squareSize, board)
        }
        const downLeft = {
            x: currX - squareSize, y: currY - squareSize,
            index: getIndexAtPosition(currX - squareSize, currY - squareSize, board)
        }
        const downRight = {
            x: currX + squareSize, y: currY - squareSize,
            index: getIndexAtPosition(currX + squareSize, currY - squareSize, board)
        }
        const upLeft = {
            x: currX - squareSize, y: currY + squareSize,
            index: getIndexAtPosition(currX - squareSize, currY + squareSize, board)
        }
        const upRight = {
            x: currX + squareSize, y: currY + squareSize,
            index: getIndexAtPosition(currX + squareSize, currY + squareSize, board)
        }
        return correctMoves([left, right, down, up, downLeft, downRight, upLeft, upRight], board)
    }

    //find all the positions where all the rooks, knights and the bishops can move
    function simulateMoves(
        leftWhiteIndex: number, rightWhiteIndex: number, leftBlackIndex: number, rightBlackIndex: number,
        validMovesFunction: (x: number, y: number, index: number, board: Pieces[]) => Moves[], board: Pieces[]) {

        const leftWhitePiece = board[leftWhiteIndex].isAlive ?
            validMovesFunction(board[leftWhiteIndex].x, board[leftWhiteIndex].y, leftWhiteIndex, board) : []

        const rightWhitePiece = board[rightWhiteIndex].isAlive ?
            validMovesFunction(board[rightWhiteIndex].x, board[rightWhiteIndex].y, rightWhiteIndex, board) : []

        const leftBlackPiece = board[leftBlackIndex].isAlive ?
            validMovesFunction(board[leftBlackIndex].x, board[leftBlackIndex].y, leftBlackIndex, board) : []

        const rightBlackPiece = board[rightBlackIndex].isAlive ?
            validMovesFunction(board[rightBlackIndex].x, board[rightBlackIndex].y, rightBlackIndex, board) : []

        return {blackMoves: [...leftBlackPiece, ...rightBlackPiece], whiteMoves: [...leftWhitePiece, ...rightWhitePiece]}
    }

    function getPossibleMovesForRooks(board: Pieces[]){
        return simulateMoves(3, 31, 0, 28, rookValidMoves, board)
    }

    function getPossibleMovesForKnights(board: Pieces[]){
        return simulateMoves(7, 27, 4, 24, knightValidMoves, board)
    }

    function getPossibleMovesForBishops(board: Pieces[]){
        return simulateMoves(11, 23, 8, 20, bishopValidMoves, board)
    }

    function getPossibleMovesForQueen(board: Pieces[]){
        const whitePieceIndex = 15
        const blackPieceIndex = 12

        const whitePiece = queenValidMoves(board[whitePieceIndex].x, board[whitePieceIndex].y, whitePieceIndex, board)
        const blackPiece = queenValidMoves(board[blackPieceIndex].x, board[blackPieceIndex].y, blackPieceIndex, board)

        return {blackMoves:  [...blackPiece], whiteMoves: [...whitePiece]}
    }

    function getPossibleMovesForKing(board: Pieces[]){
        const whitePiece = kingValidMoves(white_king.x, white_king.y, board)
        const blackPiece = kingValidMoves(black_king.x, black_king.y, board)
        return {blackMoves:  [...blackPiece], whiteMoves: [...whitePiece]}
    }

    function getPossibleMovesForPawns(board: Pieces[]){
        let blackMoves = []
        let whiteMoves = []

        let whitePawnIndex = 2
        let blackPawnIndex = 1
        while (whitePawnIndex < board.length){
            const whitePos = {x: board[whitePawnIndex].x, y: board[whitePawnIndex].y, index: whitePawnIndex}
            const whiteRight = {
                x: pawnPossibleMoves(whitePos.x, whitePos.y, whitePos.index).topRight.x,
                y: pawnPossibleMoves(whitePos.x, whitePos.y, whitePos.index).topRight.y,
                index: pawnPossibleMoves(whitePos.x, whitePos.y, whitePos.index).topRightIndex
            }
            const whiteLeft = {
                x: pawnPossibleMoves(whitePos.x, whitePos.y, whitePos.index).topLeft.x,
                y: pawnPossibleMoves(whitePos.x, whitePos.y, whitePos.index).topLeft.y,
                index: pawnPossibleMoves(whitePos.x, whitePos.y, whitePos.index).topLeftIndex
            }

            const blackPos = {x: board[blackPawnIndex].x, y: board[blackPawnIndex].y, index: blackPawnIndex}
            const blackRight = {
                x: pawnPossibleMoves(blackPos.x, blackPos.y, blackPos.index).topRight.x,
                y: pawnPossibleMoves(blackPos.x, blackPos.y, blackPos.index).topRight.y,
                index: pawnPossibleMoves(blackPos.x, blackPos.y, blackPos.index).topRightIndex
            }
            const blackLeft = {
                x: pawnPossibleMoves(blackPos.x, blackPos.y, blackPos.index).topLeft.x,
                y: pawnPossibleMoves(blackPos.x, blackPos.y, blackPos.index).topLeft.y,
                index: pawnPossibleMoves(blackPos.x, blackPos.y, blackPos.index).topLeftIndex
            }
            whiteMoves.push(whiteLeft)
            whiteMoves.push(whiteRight)
            blackMoves.push(blackLeft)
            blackMoves.push(blackRight)

            whitePawnIndex += 4 // next white pawn
            blackPawnIndex += 4 // next black pawn
        }
        return {whiteMoves, blackMoves}
    }

    function getPossibleMovesForAllBlackPieces(board: Pieces[]){
        return [
            ...getPossibleMovesForRooks(board).blackMoves,
            ...getPossibleMovesForKnights(board).blackMoves,
            ...getPossibleMovesForBishops(board).blackMoves,
            ...getPossibleMovesForQueen(board).blackMoves,
            ...getPossibleMovesForPawns(board).blackMoves,
            ...getPossibleMovesForKing(board).blackMoves
        ]
    }

    function getPossibleMovesForAllWhitePieces(board: Pieces[]){
        return [
            ...getPossibleMovesForRooks(board).whiteMoves,
            ...getPossibleMovesForKnights(board).whiteMoves,
            ...getPossibleMovesForBishops(board).whiteMoves,
            ...getPossibleMovesForQueen(board).whiteMoves,
            ...getPossibleMovesForPawns(board).whiteMoves,
            ...getPossibleMovesForKing(board).whiteMoves
        ]
    }

    //king cant move to the position where enemy piece can move
    function handleKingMovement() {
        const {currX, currY} = getCurrentPosition()
        const validMoves: Moves[] = []

        if (draggingIndex === white_king_index){
            for (let kingPosition of kingValidMoves(currX, currY, positions)){
                const board = positions.map(pos => ({...pos}));
                board[white_king_index] = {x: kingPosition.x, y: kingPosition.y, isAlive: true}
                let allBlackMoves = getPossibleMovesForAllBlackPieces(board)
                if (!isPieceOnSquare(kingPosition.x, kingPosition.y, allBlackMoves)) validMoves.push(kingPosition)
            }
        } else {
            for (let kingPosition of kingValidMoves(currX, currY, positions)){
                const board = positions.map(pos => ({...pos}));
                board[black_king_index] = {x: kingPosition.x, y: kingPosition.y, isAlive: true}
                let allWhiteMoves = getPossibleMovesForAllWhitePieces(board)
                if (!isPieceOnSquare(kingPosition.x, kingPosition.y, allWhiteMoves)) validMoves.push(kingPosition)
            }
        }
        return validMoves
    }

    function movementHandler(allMovesFunction: (board: Pieces[]) => Moves[], king: Positions,
                             validMovesFunction: (currX: number, currY: number, index: number, board: Pieces[]) => Moves[]) {
        const {currX, currY} = getCurrentPosition()
        const index = getIndexAtPosition(currX, currY, positions)
        const updatedValidMoves = []
        for (let move of validMovesFunction(currX, currY, index, positions)) {
            const newBoard = positions.map(pos => ({...pos}));

            const potentialKilledPiece = getIndexAtPosition(move.x, move.y, newBoard)
            newBoard[index] = {x: move.x, y: move.y, isAlive: true}
            newBoard[potentialKilledPiece] = {x: -1000, y: -1000, isAlive: false}
            if (potentialKilledPiece !== -1) redSquares.push({x: move.x, y: move.y})

            const allMoves = allMovesFunction(newBoard)
            if (!isPieceOnSquare(king.x, king.y, allMoves)) updatedValidMoves.push(move)
        }
        return updatedValidMoves
    }

    const handleQueenMovement = () => {
        if (color_name_arr[draggingIndex].color === "white") {
            return movementHandler(getPossibleMovesForAllBlackPieces, white_king, queenValidMoves)
        }
        else return movementHandler(getPossibleMovesForAllWhitePieces, black_king, queenValidMoves)
    }

    const handleRookMovement = () => {
        if (color_name_arr[draggingIndex].color === "white") {
            return movementHandler(getPossibleMovesForAllBlackPieces, white_king, rookValidMoves)
        }
        else return movementHandler(getPossibleMovesForAllWhitePieces, black_king, rookValidMoves)
    }

    const handleBishopMovement = () => {
        if (color_name_arr[draggingIndex].color === "white") {
            return movementHandler(getPossibleMovesForAllBlackPieces, white_king, bishopValidMoves)
        }
        else return movementHandler(getPossibleMovesForAllWhitePieces, black_king, bishopValidMoves)
    }

    const handleKnightMovement = () => {
        if (color_name_arr[draggingIndex].color === "white") {
            return movementHandler(getPossibleMovesForAllBlackPieces, white_king, knightValidMoves)
        }
        else return movementHandler(getPossibleMovesForAllWhitePieces, black_king, knightValidMoves)
    }

    const movePieces = () => {
        const pieceImageShift = (squareSize - imageSize) / 2;
        let {x, y} = adjustPiecePositions()

        if (draggingIndex !== -1 && pieces[draggingIndex].isAlive) {
            const {currX, currY} = getCurrentPosition()

            const resetPosition = () => {
                x = currX;
                y = currY;
            }

            if (color_name_arr[draggingIndex].name === "pawn"){
                const white = color_name_arr[draggingIndex].color === "white"
                const index = getIndexAtPosition(currX, currY, positions)
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
                const {topLeft, topRight, inFront, topLeftIndex, topRightIndex} = pawnPossibleMoves(currX, currY, index)

                if (isPieceOnSquare(topLeft.x, topLeft.y, positions) &&
                    color_name_arr[topLeftIndex].color !== color_name_arr[draggingIndex].color){
                    posXStart -= squareSize;
                }
                if (isPieceOnSquare(topRight.x, topRight.y, positions) &&
                    color_name_arr[topRightIndex].color !== color_name_arr[draggingIndex].color){
                    posXEnd += squareSize;
                }

                //if pawn has not moved yet, give it an ability to move two squares in front
                const whitePawnInitialPositionY = canvasSize - 2 * squareSize
                if (white && currY >= whitePawnInitialPositionY && !isPieceOnSquare(inFront.x, inFront.y, positions)
                    && !isPieceOnSquare(inFront.x, inFront.y - squareSize, positions)){
                    posYStart -= squareSize
                }
                const blackPawnInitialPositionY = 2 * squareSize
                if (!white && currY <= blackPawnInitialPositionY && !isPieceOnSquare(inFront.x, inFront.y, positions)
                    && !isPieceOnSquare(inFront.x, inFront.y + squareSize, positions)){
                    posYEnd += squareSize
                }

                if (isPieceOnSquare(inFront.x, inFront.y, positions) &&
                    (inFront.x <= x && x <= inFront.x + squareSize - pieceImageShift)){
                    resetPosition()
                }
                if ((posXStart >= x || x >= posXEnd) || (posYEnd <= y || y <= posYStart)){
                    resetPosition()
                }
                else {
                    if (x === topLeft.x && y === topLeft.y) {
                        killedPiecePosition = {x: topLeft.x, y: topLeft.y}
                    }
                    if (x === topRight.x && y === topRight.y) {
                        killedPiecePosition = {x: topRight.x, y: topRight.y}
                    }
                }
            }

            if (color_name_arr[draggingIndex].name === "rook") {
                if (!checkIfValid(handleRookMovement())) resetPosition()
            }
            if (color_name_arr[draggingIndex].name === "knight") {
                if (!checkIfValid(handleKnightMovement())) resetPosition()
            }
            if (color_name_arr[draggingIndex].name === "bishop") {
                if (!checkIfValid(handleBishopMovement())) resetPosition()
            }
            if (color_name_arr[draggingIndex].name === "queen") {
                if (!checkIfValid(handleQueenMovement())) resetPosition()
            }
            if (color_name_arr[draggingIndex].name === "king") {
                if (!checkIfValid(handleKingMovement())) resetPosition()
            }

            const killedPieceIndex = killPieces(killedPiecePosition)
            const piecePositions = [...positions]
            if (killedPieceIndex !== -1) piecePositions[killedPieceIndex] = {x: -1000, y: -1000, isAlive: false}
            piecePositions[draggingIndex] = {x: x, y: y, isAlive: true}
            setPositions(piecePositions)
        }
    }

    const colorSquares = () => {
        const {currX, currY} = getCurrentPosition()
        if (color_name_arr[draggingIndex].name === "pawn"){
            const white = color_name_arr[draggingIndex].color === "white"
            const index = getIndexAtPosition(currX, currY, positions)
            const {topLeft, topRight, inFront, topLeftIndex, topRightIndex} = pawnPossibleMoves(currX, currY, index)

            if (!isPieceOnSquare(inFront.x, inFront.y, positions)){
                greenSquares.push({x: inFront.x, y: inFront.y})
            }
            if (isPieceOnSquare(topLeft.x, topLeft.y, positions) &&
                color_name_arr[topLeftIndex].color !== color_name_arr[draggingIndex].color){
                redSquaresPawn.push({x: topLeft.x, y: topLeft.y})
            }
            if (isPieceOnSquare(topRight.x, topRight.y, positions) &&
                color_name_arr[topRightIndex].color !== color_name_arr[draggingIndex].color){
                redSquaresPawn.push({x: topRight.x, y: topRight.y})
            }
            if (white && currY >= canvasSize - 2 * squareSize && !isPieceOnSquare(inFront.x, inFront.y, positions)
                && !isPieceOnSquare(inFront.x, inFront.y - squareSize, positions)){
                greenSquares.push({x: inFront.x, y: inFront.y - squareSize})
            }
            if (!white && currY <= 2 * squareSize && !isPieceOnSquare(inFront.x, inFront.y, positions)
                && !isPieceOnSquare(inFront.x, inFront.y + squareSize, positions)){
                greenSquares.push({x: inFront.x, y: inFront.y + squareSize})
            }
        }
        if (color_name_arr[draggingIndex].name === "rook"){
            greenSquares = handleRookMovement()
        }
        if (color_name_arr[draggingIndex].name === "knight"){
            greenSquares = handleKnightMovement()
        }
        if (color_name_arr[draggingIndex].name === "bishop"){
            greenSquares = handleBishopMovement()
        }
        if (color_name_arr[draggingIndex].name === "king"){
            greenSquares = handleKingMovement()
        }
        if (color_name_arr[draggingIndex].name === "queen"){
            greenSquares = handleQueenMovement()
        }
    }

    const drawGreenCircles = (ctx: CanvasRenderingContext2D) => {
        for (let pos of greenSquares) {
            const gradient = ctx.createRadialGradient(pos.x + 25, pos.y + 25,
                0, pos.x + 25, pos.y + 25, squareSize / 4
            );
            gradient.addColorStop(0, "#06f67d");
            gradient.addColorStop(1, "#066e52");

            ctx.beginPath();
            ctx.arc(pos.x + 25, pos.y + 25, squareSize / 8, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    const drawRedBackground = (ctx: CanvasRenderingContext2D) => {
        for (let pos of redSquares) {
            if (greenSquares.some(p => p.x === pos.x && p.y === pos.y)) {
                ctx.fillStyle = "#b20101"
                ctx.fillRect(pos.x - 10, pos.y - 10, squareSize - 5, squareSize - 5);
            }
        }
        for (let pos of redSquaresPawn){
            ctx.fillStyle = "#dc0606"
            ctx.fillRect(pos.x - 10, pos.y - 10, squareSize - 5, squareSize - 5);
        }
    }

    const drawBoardBackground = (ctx: CanvasRenderingContext2D) => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * squareSize;
                const y = row * squareSize;
                ctx.fillStyle = (row + col) % 2 === 0 ? "#1A233B" : "#808080"
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }

    const draw_pieces = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        drawBoardBackground(ctx)
        drawGreenCircles(ctx)
        drawRedBackground(ctx)
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
        <div>
            <canvas
                className={"chessboard"}
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                onMouseDown={onMouseDown}
            />
        </div>
    )
}