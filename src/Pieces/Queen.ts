import {ColorPiece, Moves, Positions} from "../types";
import {Rook} from "./Rook";
import {Bishop} from "./Bishop";

export class Queen {
    Indexes = [15, 12]

    validMoves(currX: number, currY: number, index: number, board: Positions[], pieceColors: ColorPiece[]): Moves[] {
        const bishop = new Bishop()
        const rook = new Rook()
        return [
            ...rook.validMoves(currX, currY, index, board, pieceColors),
            ...bishop.validMoves(currX, currY, index, board, pieceColors)
        ]
    }
}