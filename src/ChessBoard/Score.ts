import {ColorPiece, PieceType} from "../types";
import {Team} from "./Team";
import {createImage} from "../Canvas/utils";

export class Score{
    static whiteScore: number = 0
    static blackScore: number = 0
    killedPieceIndex: number
    pieceColors: ColorPiece[]
    pieces: PieceType[]

    constructor(killedPieceIndex: number, pieceColors: ColorPiece[], pieces: PieceType[]) {
        this.killedPieceIndex = killedPieceIndex
        this.pieceColors = pieceColors
        this.pieces = pieces
    }

    addScore(){
        let playerScore = 0
        switch (this.pieceColors[this.killedPieceIndex].name){
            case "pawn":
                playerScore += 1
                break
            case "knight":
                playerScore += 3
                break
            case "bishop":
                playerScore += 3
                break
            case "rook":
                playerScore += 5
                break
            case "queen":
                playerScore += 9
                break
        }
        if (this.pieceColors[this.killedPieceIndex].color === "black") {
            Score.whiteScore += playerScore
            Team.blackKilledPieces.push(createImage(this.pieces[this.killedPieceIndex].src))
        }
        else {
            Score.blackScore += playerScore
            Team.whiteKilledPieces.push(createImage(this.pieces[this.killedPieceIndex].src))
        }
    }
}
