import {PieceType, Positions} from "../Utils/types";
import Game from "../ChessBoard/Game";
import {Pieces} from "../Utils/exports";

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
        return this.game.getValidMovesForKnightOrKing(piece,
            [left, right, down, up, downLeft, downRight, upLeft, upRight], chessboard)
    }
}
