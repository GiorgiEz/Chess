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

type Figure = {
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
        const index = getIndexAtPosition(mousePositions.x, mousePositions.y);
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
        const index = getIndexAtPosition(pos.x, pos.y)
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

    const getIndexAtPosition = (x: number, y: number) => {
        for (let i = 0; i < positions.length; i++) {
            const { x: imageX, y: imageY } = positions[i];
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
    const correctMoves = (Moves: Moves[]) => {
        let validMoves: Moves[] = []
        for (let i = 0; i < Moves.length; i++){
            const move = {x: Moves[i].x, y: Moves[i].y, index: Moves[i].index}
            if (move.x >= 0 && move.x <= canvasSize && move.y >= 0 && move.y <= canvasSize) {
                if (color_name_arr[move.index]) {
                    const sameColors = color_name_arr[move.index].color === color_name_arr[draggingIndex].color
                    if (isPieceOnSquare(move.x, move.y, positions) && !sameColors) {
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
        const topLeftIndex = getIndexAtPosition(topLeft.x, topLeft.y)
        const topRightIndex = getIndexAtPosition(topRight.x, topRight.y)
        return {topLeft, topRight, inFront, topLeftIndex, topRightIndex}
    }

    const getValidMovesForRookOrBishop = (
        dx: number, dy: number, currX: number, currY: number, dragIndex: number, board: Positions[]
    ) => {
        let validMoves: Moves[] = [];
        if (color_name_arr[draggingIndex].name === "king") dragIndex = draggingIndex

        for (let square = squareSize; square < canvasSize; square += squareSize) {
            const x = currX + square * dx;
            const y = currY + square * dy;
            const index = getIndexAtPosition(x, y);

            if (x >= 0 && x <= canvasSize && y >= 0 && y <= canvasSize) {
                if (color_name_arr[index] && color_name_arr[dragIndex]) {
                    const sameColors = color_name_arr[index].color === color_name_arr[dragIndex].color;
                    if (isPieceOnSquare(x, y, board) && sameColors) break;
                    else if (isPieceOnSquare(x, y, board) && !sameColors) {
                        redSquares.push({x, y})
                        validMoves.push({x, y, index});
                        break;
                    }
                }
                validMoves.push({x, y, index});
            }
        }
        return validMoves;
    }

    const rookValidMoves = (currX: number, currY: number, index: number, board: Positions[]) => {
        let validMoves: Moves[] = [];

        validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, 0, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, 0, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(0, -1, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(0, 1, currX, currY, index, board));
        return validMoves
    }

    const bishopValidMoves = (currX: number, currY: number, index: number, board: Positions[]) => {
        let validMoves: Moves[] = [];

        validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, 1, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, -1, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, 1, currX, currY, index, board));
        validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, -1, currX, currY, index, board));

        return validMoves
    }

    const knightValidMoves = (currX: number, currY: number) => {
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
            index: getIndexAtPosition(currX - squareSize, currY - 2 * squareSize),}

        const downRight = {x: currX + squareSize, y: currY - 2 * squareSize,
            index: getIndexAtPosition(currX + squareSize, currY - 2 * squareSize),}

        const rightDown = {x: currX + 2 * squareSize, y: currY - squareSize,
            index: getIndexAtPosition(currX + 2 * squareSize, currY - squareSize),}

        const rightUp = {x: currX + 2 * squareSize, y: currY + squareSize,
            index: getIndexAtPosition(currX + 2 * squareSize, currY + squareSize),}

        return correctMoves([upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp])
    }

    const queenValidMoves = (currX: number, currY: number, index: number, board: Positions[]) => {
        return [...rookValidMoves(currX, currY, index, board), ...bishopValidMoves(currX, currY, index, board)]
    }

    const kingValidMoves = (currX: number, currY: number) => {
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
        return correctMoves([left, right, down, up, downLeft, downRight, upLeft, upRight])
    }

    //find all the positions where all the rooks, knights and the bishops can move
    function simulateMoves(
        leftWhiteIndex: number, rightWhiteIndex: number, leftBlackIndex: number, rightBlackIndex: number,
        validMovesFunction: (x: number, y: number, index: number, board: Figure[]) => Moves[], board: Figure[]) {

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

    function getPossibleMovesForRooks(board: Figure[]){
        return simulateMoves(3, 31, 0, 28, rookValidMoves, board)
    }

    function getPossibleMovesForKnights(){
        return simulateMoves(7, 27, 4, 24, knightValidMoves, positions)
    }

    function getPossibleMovesForBishops(board: Figure[]){
        return simulateMoves(11, 23, 8, 20, bishopValidMoves, board)
    }

    function getPossibleMovesForQueen(board: Figure[]){
        const whitePieceIndex = 15
        const blackPieceIndex = 12

        const whitePiece = queenValidMoves(board[whitePieceIndex].x, board[whitePieceIndex].y, whitePieceIndex, board)
        const blackPiece = queenValidMoves(board[blackPieceIndex].x, board[blackPieceIndex].y, blackPieceIndex, board)

        return {blackMoves:  [...blackPiece], whiteMoves: [...whitePiece]}
    }

    function getPossibleMovesForKing(){
        const whitePiece = kingValidMoves(white_king.x, white_king.y)
        const blackPiece = kingValidMoves(black_king.x, black_king.y)
        return {blackMoves:  [...blackPiece], whiteMoves: [...whitePiece]}
    }

    function getPossibleMovesForPawns(){
        let blackMoves = []
        let whiteMoves = []

        let whitePawnIndex = 2
        let blackPawnIndex = 1
        while (whitePawnIndex < positions.length){
            const whitePos = {x: positions[whitePawnIndex].x, y: positions[whitePawnIndex].y, index: whitePawnIndex}
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

            const blackPos = {x: positions[blackPawnIndex].x, y: positions[blackPawnIndex].y, index: blackPawnIndex}
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

    function getPossibleMovesForAllBlackPieces(board: Figure[]){
        return [
            ...getPossibleMovesForRooks(board).blackMoves,
            ...getPossibleMovesForKnights().blackMoves,
            ...getPossibleMovesForBishops(board).blackMoves,
            ...getPossibleMovesForQueen(board).blackMoves,
            ...getPossibleMovesForPawns().blackMoves,
            ...getPossibleMovesForKing().blackMoves
        ]
    }

    function getPossibleMovesForAllWhitePieces(board: Figure[]){
        return [
            ...getPossibleMovesForRooks(board).whiteMoves,
            ...getPossibleMovesForKnights().whiteMoves,
            ...getPossibleMovesForBishops(board).whiteMoves,
            ...getPossibleMovesForQueen(board).whiteMoves,
            ...getPossibleMovesForPawns().whiteMoves,
            ...getPossibleMovesForKing().whiteMoves
        ]
    }

    //king cant move to the position where enemy piece can move
    function handleKingMovement() {
        const {currX, currY} = getCurrentPosition()
        const validMoves: Moves[] = []

        if (draggingIndex === white_king_index){
            const board = positions.map(pos => ({...pos}));
            for (let kingPosition of kingValidMoves(currX, currY)){
                board[white_king_index] = {x: kingPosition.x, y: kingPosition.y, isAlive: true}
                let allBlackMoves = getPossibleMovesForAllBlackPieces(board)
                if (!isPieceOnSquare(kingPosition.x, kingPosition.y, allBlackMoves)) validMoves.push(kingPosition)
            }
        } else {
            const board = positions.map(pos => ({...pos}));
            for (let kingPosition of kingValidMoves(currX, currY)){
                board[black_king_index] = {x: kingPosition.x, y: kingPosition.y, isAlive: true}
                let allWhiteMoves = getPossibleMovesForAllWhitePieces(board)
                if (!isPieceOnSquare(kingPosition.x, kingPosition.y, allWhiteMoves)) validMoves.push(kingPosition)
            }
        }
        return validMoves
    }

    //1. find all positions where the dragging piece can go
    //2. find all positions where the enemy pieces can go
    //3. simulate if dragging piece is moved to the positions where it can go
    //   and for each position see if king is getting threatened by the enemy piece,
    //   if threatened, then it's not a legal move for dragging piece to go there.

    const handleQueenMovement = () => {
        const {currX, currY} = getCurrentPosition()
        const updatedValidMoves = []

        if (color_name_arr[draggingIndex].name === "queen" && color_name_arr[draggingIndex].color === "white") {
            const index = getIndexAtPosition(currX, currY)
            const newBoard = positions.map(pos => ({...pos}));
            for (let move of queenValidMoves(currX, currY, index, positions)) {
                newBoard[index] = {x: move.x, y: move.y, isAlive: true}
                const allBlackMoves = getPossibleMovesForAllBlackPieces(newBoard)
                if (!isPieceOnSquare(white_king.x, white_king.y, allBlackMoves))
                    updatedValidMoves.push(move)
            }
        }
        else if (color_name_arr[draggingIndex].name === "queen" && color_name_arr[draggingIndex].color === "black") {
            const index = getIndexAtPosition(currX, currY)
            const newBoard = positions.map(pos => ({...pos}));
            for (let move of queenValidMoves(currX, currY, index, positions)) {
                newBoard[index] = {x: move.x, y: move.y, isAlive: true}
                const allWhiteMoves = getPossibleMovesForAllWhitePieces(newBoard)
                if (!isPieceOnSquare(black_king.x, black_king.y, allWhiteMoves))
                    updatedValidMoves.push(move)
            }
        }
        return updatedValidMoves
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
                const index = getIndexAtPosition(currX, currY)
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
                if (!checkIfValid(rookValidMoves(currX, currY, getIndexAtPosition(currX, currY), positions))) resetPosition()
            }
            if (color_name_arr[draggingIndex].name === "knight") {
                if (!checkIfValid(knightValidMoves(currX, currY))) resetPosition()
            }
            if (color_name_arr[draggingIndex].name === "bishop") {
                if (!checkIfValid(bishopValidMoves(currX, currY, getIndexAtPosition(currX, currY), positions))) resetPosition()
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
            const index = getIndexAtPosition(currX, currY)
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
            greenSquares = rookValidMoves(currX, currY, getIndexAtPosition(currX, currY), positions)
        }
        if (color_name_arr[draggingIndex].name === "knight"){
            greenSquares = knightValidMoves(currX, currY)
        }
        if (color_name_arr[draggingIndex].name === "bishop"){
            greenSquares = bishopValidMoves(currX, currY, getIndexAtPosition(currX, currY), positions)
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