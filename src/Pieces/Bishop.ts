import {PieceType, Positions} from "../Utils/types";
import Game from "../ChessBoard/Game";

export class Bishop{
    private game: Game;

    constructor() {
        this.game = Game.getInstance();
    }

    validMoves(piece: PieceType, chessboard: PieceType[]): Positions[] {
        return this.game.getValidMovesForRookOrBishop(1, 1, piece, chessboard)
            .concat(this.game.getValidMovesForRookOrBishop(1, -1, piece, chessboard))
            .concat(this.game.getValidMovesForRookOrBishop(-1, 1, piece, chessboard))
            .concat(this.game.getValidMovesForRookOrBishop(-1, -1, piece, chessboard))
    }
}
