import {Moves, ColorPiece, Positions, IsAlive} from "../Utils/types";
import {getValidMovesForRookOrBishop} from "../Utils/utils";
import Piece from "./Piece";

export function bishopValidMoves(currX: number, currY: number, index: number, board: Positions[], color_name_arr: ColorPiece[]){
    let validMoves: Moves[] = [];

    validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, 1, currX, currY, index, board, color_name_arr));
    validMoves = validMoves.concat(getValidMovesForRookOrBishop(1, -1, currX, currY, index, board, color_name_arr));
    validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, 1, currX, currY, index, board, color_name_arr));
    validMoves = validMoves.concat(getValidMovesForRookOrBishop(-1, -1, currX, currY, index, board, color_name_arr));

    return validMoves
}

export class Bishop extends Piece{
    constructor(
        src: string,
        x: number,
        y:number,
        color: "white" | "black",
        name: string,
        isAlive: boolean,
        validMoves: Positions[],
        board: IsAlive[],
    ) {
        super(src, x, y, color, name, isAlive, validMoves, board);
    }

    pieceValidMoves(pieceColors: ColorPiece[]): Positions[] {
        const index = this.pieceIndex()
        return this.validMoves.concat
            (getValidMovesForRookOrBishop
                (1, 1, this.x, this.y, index, this.board, pieceColors))
                    .concat(getValidMovesForRookOrBishop
                        (1, -1, this.x, this.y, index, this.board, pieceColors))
                        .concat(getValidMovesForRookOrBishop
                            (-1, 1, this.x, this.y, index, this.board, pieceColors))
                            .concat(getValidMovesForRookOrBishop
                                (-1, -1, this.x, this.y, index, this.board, pieceColors))
    }
}