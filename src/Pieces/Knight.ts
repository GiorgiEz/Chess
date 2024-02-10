import {PieceType} from "../Utils/types";
import {getValidMovesForKnightOrKing} from "./moves/Movements";
import Game from "../ChessBoard/Game";

export class Knight{
    private size: Game;

    constructor() {
        this.size = Game.getInstance();
    }

    validMoves(piece: PieceType, chessboard: PieceType[]) {
        if (!piece) return []
        const {x, y} = piece
        const upLeft = {
            x: x - this.size.squareSize, y: y + 2 * this.size.squareSize,
        }

        const upRight = {
            x: x + this.size.squareSize, y: y + 2 * this.size.squareSize,
        }

        const leftUp = {
            x: x - 2 * this.size.squareSize, y: y + this.size.squareSize,
        }

        const leftDown = {
            x: x - 2 * this.size.squareSize, y: y - this.size.squareSize,
        }

        const downLeft = {
            x: x - this.size.squareSize, y: y - 2 * this.size.squareSize,
        }

        const downRight = {
            x: x + this.size.squareSize, y: y - 2 * this.size.squareSize,
        }

        const rightDown = {
            x: x + 2 * this.size.squareSize, y: y - this.size.squareSize,
        }

        const rightUp = {
            x: x + 2 * this.size.squareSize, y: y + this.size.squareSize,
        }

        return getValidMovesForKnightOrKing(
            piece, [upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp], chessboard)
    }
}
