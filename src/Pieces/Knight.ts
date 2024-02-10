import {PieceType} from "../Utils/types";
import Game from "../ChessBoard/Game";

export class Knight{
    private game: Game;

    constructor() {
        this.game = Game.getInstance();
    }

    validMoves(piece: PieceType, chessboard: PieceType[]) {
        if (!piece) return []
        const {x, y} = piece
        const upLeft = {
            x: x - this.game.squareSize, y: y + 2 * this.game.squareSize,
        }

        const upRight = {
            x: x + this.game.squareSize, y: y + 2 * this.game.squareSize,
        }

        const leftUp = {
            x: x - 2 * this.game.squareSize, y: y + this.game.squareSize,
        }

        const leftDown = {
            x: x - 2 * this.game.squareSize, y: y - this.game.squareSize,
        }

        const downLeft = {
            x: x - this.game.squareSize, y: y - 2 * this.game.squareSize,
        }

        const downRight = {
            x: x + this.game.squareSize, y: y - 2 * this.game.squareSize,
        }

        const rightDown = {
            x: x + 2 * this.game.squareSize, y: y - this.game.squareSize,
        }

        const rightUp = {
            x: x + 2 * this.game.squareSize, y: y + this.game.squareSize,
        }

        return this.game.getValidMovesForKnightOrKing(piece,
            [upLeft, upRight, leftUp, leftDown, downLeft, downRight, rightDown, rightUp], chessboard)
    }
}
