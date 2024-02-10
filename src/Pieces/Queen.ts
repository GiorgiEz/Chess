import {PieceType, Positions} from "../Utils/types";
import {Rook} from "./Rook";
import {Bishop} from "./Bishop";

export class Queen{
    validMoves(piece: PieceType, chessboard: PieceType[]): Positions[] {
        const bishop = new Bishop()
        const rook = new Rook()
        return [
            ...rook.validMoves(piece, chessboard),
            ...bishop.validMoves(piece, chessboard)
        ]
    }
}
