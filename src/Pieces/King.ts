import {PieceType, Positions} from "../Utils/types";
import Game from "../ChessBoard/Game";
import {getPieceAtPosition, isPieceOnSquare} from "../Utils/utilFunctions";
import {Pieces} from "../Utils/exports";
import {getValidMovesForKnightOrKing} from "./moves/Movements";

export class King{
    private game: Game;
    static hasWhiteKingMoved = false
    static hasBlackKingMoved = false

    constructor() {
        this.game = Game.getInstance();
    }

    static getWhiteKing(chessboard: PieceType[]) {
        return chessboard.filter((king: PieceType) => king.color === "white" && king.name === Pieces.KING)[0]
    }

    static getBlackKing(chessboard: PieceType[]) {
        return chessboard.filter((king: PieceType) => king.color === "black" && king.name === Pieces.KING)[0]
    }

    validMoves(piece: PieceType, chessboard: PieceType[]): Positions[] {
        if (!piece) return []
        const {x,y} = piece
        const left = {
            x: x - this.game.squareSize, y: y,
        }
        const right = {
            x: x + this.game.squareSize, y: y,
        }
        const down = {
            x: x, y: y - this.game.squareSize,
        }
        const up = {
            x: x, y: y + this.game.squareSize,
        }
        const downLeft = {
            x: x - this.game.squareSize, y: y - this.game.squareSize,
        }
        const downRight = {
            x: x + this.game.squareSize, y: y - this.game.squareSize,
        }
        const upLeft = {
            x: x - this.game.squareSize, y: y + this.game.squareSize,
        }
        const upRight = {
            x: x + this.game.squareSize, y: y + this.game.squareSize,
        }
        return getValidMovesForKnightOrKing(piece, [left, right, down, up, downLeft, downRight, upLeft, upRight], chessboard)
    }

    //king cant move to the position where enemy pieces can move
    kingMovementHandler(king: PieceType, allMovesFunction: any) {
        const validMoves: Positions[] = []

        for (let move of this.validMoves(king, this.game.chessboard)) {
            let chessboardCopy = this.game.chessboard.map(pos => ({...pos}));

            const potentiallyKilledPiece = getPieceAtPosition(move.x, move.y)
            if (potentiallyKilledPiece) {
                chessboardCopy[potentiallyKilledPiece.index] = {...potentiallyKilledPiece, x: -1000, y: -1000}
            }
            chessboardCopy[king.index] = {...king, x: move.x, y: move.y};

            if (!isPieceOnSquare(move.x, move.y, allMovesFunction(chessboardCopy))) {
                if (potentiallyKilledPiece !== null && potentiallyKilledPiece.color !== king.color) {
                    this.game.threatenedSquares.push(move)
                }
                validMoves.push(move)
            }
        }
        return validMoves
    }
}
