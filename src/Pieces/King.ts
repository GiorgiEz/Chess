import {AlivePiece, AllMovesFunction, ColorPiece, Moves, Positions} from "../types";
import {Rook} from "./Rook";
import {
    getPossibleMovesForBishops, getPossibleMovesForKnights, getPossibleMovesForPawns,
    getPossibleMovesForQueens, getPossibleMovesForRooks
} from "./AllMoves";
import {
    getCurrPos,
    getIndexAtPosition, includes, isPieceOnSquare,
} from "../Canvas/utils";
import {getValidMovesForKnightOrKing} from "./Movements";
import {canvasWidth, shiftImage, squareSize} from "../exports";

export class King{
    static white_king = {index: 19, hasMoved: false}
    static black_king = {index: 16, hasMoved: false}

    validMoves(x: number, y: number, index: number, board: Positions[], pieceColors: ColorPiece[]): Moves[]{
        const left = {
            x: x - squareSize, y: y,
            index: getIndexAtPosition(x - squareSize, y, board)
        }
        const right = {
            x: x + squareSize, y: y,
            index: getIndexAtPosition(x + squareSize, y, board)
        }
        const down = {
            x: x, y: y - squareSize,
            index: getIndexAtPosition(x, y - squareSize, board)
        }
        const up = {
            x: x, y: y + squareSize,
            index: getIndexAtPosition(x, y + squareSize, board)
        }
        const downLeft = {
            x: x - squareSize, y: y - squareSize,
            index: getIndexAtPosition(x - squareSize, y - squareSize, board)
        }
        const downRight = {
            x: x + squareSize, y: y - squareSize,
            index: getIndexAtPosition(x + squareSize, y - squareSize, board)
        }
        const upLeft = {
            x: x - squareSize, y: y + squareSize,
            index: getIndexAtPosition(x - squareSize, y + squareSize, board)
        }
        const upRight = {
            x: x + squareSize, y: y + squareSize,
            index: getIndexAtPosition(x + squareSize, y + squareSize, board)
        }
        let validMoves: Moves[] = [left, right, down, up, downLeft, downRight, upLeft, upRight]

        const leftTwoSquares = {x: 3*squareSize + shiftImage}
        const rightTwoSquares = {x: canvasWidth - 3*squareSize + shiftImage}

        //all 3 positions between king and the rook on the queen side
        function getQueenSideMoves(x: number, board: Positions[]){
            return [
                {x: x, y, index: getIndexAtPosition(x, y, board)},
                {x: leftTwoSquares.x, y: y, index: getIndexAtPosition(leftTwoSquares.x, y, board)},
                {x: canvasWidth/2-squareSize+shiftImage, y, index: getIndexAtPosition(canvasWidth/2-squareSize+shiftImage, y, board)}
            ]
        }

        //both positions between king and the rook on the king side
        function getKingSideMoves(x: number, board: Positions[]){
            return [
                {x: x, y, index: getIndexAtPosition(x, y, board)},
                {x: rightTwoSquares.x, y, index: getIndexAtPosition(rightTwoSquares.x, y, board)}
            ]
        }

        const allBlackPieceMoves = [
            ...getPossibleMovesForRooks(board, pieceColors).blackMoves,
            ...getPossibleMovesForKnights(board, pieceColors).blackMoves,
            ...getPossibleMovesForBishops(board, pieceColors).blackMoves,
            ...getPossibleMovesForQueens(board, pieceColors).blackMoves,
            ...getPossibleMovesForPawns(board, pieceColors).blackMoves,
        ]
        const allWhitePieceMoves = [
            ...getPossibleMovesForRooks(board, pieceColors).whiteMoves,
            ...getPossibleMovesForKnights(board, pieceColors).whiteMoves,
            ...getPossibleMovesForBishops(board, pieceColors).whiteMoves,
            ...getPossibleMovesForQueens(board, pieceColors).whiteMoves,
            ...getPossibleMovesForPawns(board, pieceColors).whiteMoves,
        ]

        //add valid squares to make castling possible
        const queenSideMoves = getQueenSideMoves(2*squareSize+shiftImage, board)
        const kingSideMoves = getKingSideMoves(canvasWidth/2+squareSize+shiftImage, board)

        if (index === King.white_king.index && !King.white_king.hasMoved) {
            const whiteKingUnderAttack = allBlackPieceMoves.filter(move => move.index === King.white_king.index)
            if (!Rook.leftWhiteRook.hasMoved) {
                const rookUnderAttack = allBlackPieceMoves.filter(move => move.index === Rook.leftWhiteRook.index)
                if (queenSideMoves.every(pos => !isPieceOnSquare(pos.x, pos.y, board)) &&
                    !includes(queenSideMoves, allBlackPieceMoves) && !whiteKingUnderAttack.length && !rookUnderAttack.length) {
                    validMoves.push({x: leftTwoSquares.x, y, index: getIndexAtPosition(leftTwoSquares.x, y, board)})
                }
            }
            if (!Rook.rightWhiteRook.hasMoved) {
                const rookUnderAttack = allBlackPieceMoves.filter(move => move.index === Rook.rightWhiteRook.index)
                if (kingSideMoves.every(pos => !isPieceOnSquare(pos.x, pos.y, board)) &&
                    !includes(kingSideMoves, allBlackPieceMoves) && !whiteKingUnderAttack.length && !rookUnderAttack.length) {
                    validMoves.push({x: rightTwoSquares.x, y: y, index: getIndexAtPosition(rightTwoSquares.x, y, board)})
                }
            }
        }

        if (index === King.black_king.index && !King.black_king.hasMoved) {
            const blackKingUnderAttack = allWhitePieceMoves.filter(move => move.index === King.black_king.index)
            if (!Rook.leftBlackRook.hasMoved) {
                const rookUnderAttack = allWhitePieceMoves.filter(move => move.index === Rook.leftBlackRook.index)
                if (queenSideMoves.every(pos => !isPieceOnSquare(pos.x, pos.y, board)) &&
                    !includes(queenSideMoves, allWhitePieceMoves) && !blackKingUnderAttack.length && !rookUnderAttack.length) {
                    validMoves.push({x: leftTwoSquares.x, y, index: getIndexAtPosition(leftTwoSquares.x, y, board)})
                }
            }
            if (!Rook.rightBlackRook.hasMoved) {
                const rookUnderAttack = allWhitePieceMoves.filter(move => move.index === Rook.rightBlackRook.index)
                if (kingSideMoves.every(pos => !isPieceOnSquare(pos.x, pos.y, board)) &&
                    !includes(kingSideMoves, allWhitePieceMoves) && !blackKingUnderAttack.length && !rookUnderAttack.length) {
                    validMoves.push({x: rightTwoSquares.x, y: y, index: getIndexAtPosition(rightTwoSquares.x, y, board)})
                }
            }
        }
        return getValidMovesForKnightOrKing(validMoves, board, index, pieceColors)
    }

    //king cant move to the position where enemy pieces can move
    kingMovementHandler(kingIndex: number, redSquares: Positions[], board: AlivePiece[],
                        pieceColors: ColorPiece[], allMovesFunction: AllMovesFunction
    ) {
        const {currX, currY} = getCurrPos(kingIndex, board)
        const validMoves: Moves[] = []

        for (let move of this.validMoves(currX, currY, kingIndex, board, pieceColors)) {
            const simulatedBoard = board.map(pos => ({...pos}));

            const potentiallyKilledPiece = getIndexAtPosition(move.x, move.y, simulatedBoard)
            simulatedBoard[kingIndex] = {x: move.x, y: move.y, isAlive: true}
            simulatedBoard[potentiallyKilledPiece] = {x: -1000, y: -1000, isAlive: true}

            let allBlackMoves = allMovesFunction(simulatedBoard, pieceColors)
            if (!isPieceOnSquare(move.x, move.y, allBlackMoves)) {
                if (potentiallyKilledPiece !== -1 && pieceColors[potentiallyKilledPiece].color !== pieceColors[kingIndex].color) {
                    redSquares.push({x: move.x, y: move.y})
                }
                validMoves.push(move)
            }
        }
        return validMoves
    }
}
