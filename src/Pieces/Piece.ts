import {ColorPiece, Positions} from "../Utils/types";
import {getIndexAtPosition} from "../Utils/utils";

class Piece {
    src: string;
    x: number;
    y:number;
    color: "white" | "black";
    name: string;
    isAlive: boolean;
    validMoves: Positions[];
    board: Positions[];

    constructor(
        src: string, x: number, y: number, color: "white" | "black",
        name: string, isAlive: boolean, validMoves: Positions[], board: Positions[]
    ) {
        this.src = src
        this.color = color;
        this.name = name;
        this.x = x;
        this.y = y;
        this.isAlive = isAlive;
        this.validMoves = validMoves;
        this.board = board
    }

    pieceValidMoves(pieceColors: ColorPiece[]): Positions[] {
        return this.validMoves;
    }

    pieceIndex(){
        return getIndexAtPosition(this.x, this.y, this.board)
    }

}

export default Piece;
