import {PieceType, Positions, ValidMovesFunction} from "../../Utils/types";
import {getPieceAtPosition, isPieceOnSquare} from "../../Utils/utilFunctions";
import Game from "../../ChessBoard/Game";

const game = Game.getInstance();

// Don't let a piece make illegal move if the king is or will be in danger
export function movementHandler(king: PieceType, piece: PieceType, allMovesFunction: any, validMovesFunction: ValidMovesFunction) {
    const updatedValidMoves = []

    for (let move of validMovesFunction(piece, game.chessboard)) {
        let chessboardCopy = game.chessboard.map(pos => ({...pos}));

        const potentiallyKilledPiece = getPieceAtPosition(move.x, move.y)
        if (potentiallyKilledPiece) {
            chessboardCopy[potentiallyKilledPiece.index] = {...potentiallyKilledPiece, x: -1000, y: -1000}
        }
        chessboardCopy[piece.index] = {...piece, x: move.x, y: move.y};

        if (!isPieceOnSquare(king.x, king.y, allMovesFunction(chessboardCopy))) {
            if (potentiallyKilledPiece !== null && potentiallyKilledPiece.color !== piece.color) {
                game.threatenedSquares.push(move)
            }
            updatedValidMoves.push(move)
        }
    }
    return updatedValidMoves
}

export function getValidMovesForRookOrBishop(dx: number, dy: number, piece: PieceType, chessboard: PieceType[]) {
    let validMoves: Positions[] = [];
    for (let square = game.squareSize; square < game.canvasSize; square += game.squareSize) {
        const x = piece?.x + square * dx;
        const y = piece?.y + square * dy;
        const pieceOnTheWay = getPieceAtPosition(x, y, chessboard);

        if (x >= 0 && x <= game.canvasSize && y >= 0 && y <= game.canvasSize) {
            const sameColors = pieceOnTheWay?.color === piece?.color;
            if (isPieceOnSquare(x, y, chessboard) && sameColors) {
                break;
            }
            else if (isPieceOnSquare(x, y, chessboard) && !sameColors) {
                validMoves.push({x, y});
                break;
            }
            validMoves.push({x, y});
        }
    }
    return validMoves;
}

// check if position where the king or the knight can move isn't blocked by same colored piece
export function getValidMovesForKnightOrKing(piece: PieceType, moves: Positions[], chessboard: PieceType[]) {
    let validMoves = []
    for (let move of moves){
        if (move.x >= 0 && move.x <= game.canvasSize && move.y >= 0 && move.y <= game.canvasSize) {
            const sameColors = getPieceAtPosition(move.x, move.y, chessboard)?.color === piece.color
            if (!isPieceOnSquare(move.x, move.y, chessboard) || (isPieceOnSquare(move.x, move.y, chessboard) && !sameColors)) {
                validMoves.push(move)
            }
        }
    }
    return validMoves
}
