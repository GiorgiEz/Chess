import {AlivePiece, ColorPiece, PieceType} from "../types";
import {promotePawnTo} from "./utils";
import {initialPieces} from "../ChessBoard/ChessBoard";
import {Canvas} from "./Canvas";
import {Pawn} from "../Pieces/Pawn";
import {King} from "../Pieces/King";
import {Rook} from "../Pieces/Rook";
import {boardSize, canvasWidth, pieceImages, Pieces, shiftImage, sounds, squareSize} from "../exports";
import {Score} from "../ChessBoard/Score";
import {Team} from "../ChessBoard/Team";

export class Button{
    constructor(
        private x: number,
        private y: number,
        private board: AlivePiece[],
        private pieces: PieceType[],
        private pieceColors: ColorPiece[],
        private pieceImages: HTMLImageElement[],
    ) {}

    toggleSoundButton() {
        if (this.x > squareSize && this.x < 2*squareSize && this.y > 0 && this.y < squareSize
            && (Canvas.menuScreen || Team.whiteWon || Team.blackWon || Team.staleMate)){
            sounds.sound_button_sound.play()
            Canvas.soundOn = !Canvas.soundOn;
            sounds.move_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.capture_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.castle_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.checkmate_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.stalemate_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.game_start_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.pawn_promotion_sound.volume = Canvas.soundOn ? 1: 0;
        }
    }

    promotePawnButtons() {
        if (this.pieceColors[Pawn.promotedPawnIndex]?.name === "pawn") {
            if (this.x >= squareSize && this.x <= 3*squareSize &&
                this.y >= 3*squareSize && this.y <= boardSize-3*squareSize) {
                if (this.pieceColors[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(pieceImages.white_queen, Pieces.QUEEN, this.pieces, this.pieceColors, this.pieceImages)
                else promotePawnTo(pieceImages.black_queen, Pieces.QUEEN, this.pieces, this.pieceColors, this.pieceImages)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= 3*squareSize && this.x <= canvasWidth/2 &&
                this.y >= 3*squareSize && this.y <= boardSize-3*squareSize) {
                if (this.pieceColors[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(pieceImages.white_rook, Pieces.ROOK, this.pieces, this.pieceColors, this.pieceImages)
                else promotePawnTo(pieceImages.black_rook, Pieces.ROOK, this.pieces, this.pieceColors, this.pieceImages)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= canvasWidth/2 && this.x <= canvasWidth/2+squareSize*2 &&
                this.y >= 3*squareSize && this.y <= boardSize-3*squareSize) {
                if (this.pieceColors[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(pieceImages.white_bishop, Pieces.BISHOP, this.pieces, this.pieceColors, this.pieceImages)
                else promotePawnTo(pieceImages.black_bishop, Pieces.BISHOP, this.pieces, this.pieceColors, this.pieceImages)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= canvasWidth/2+squareSize*2 && this.x <= canvasWidth-squareSize &&
                this.y >= 3*squareSize && this.y <= boardSize-3*squareSize) {
                if (this.pieceColors[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(pieceImages.white_knight, Pieces.KNIGHT, this.pieces, this.pieceColors, this.pieceImages)
                else promotePawnTo(pieceImages.black_knight, Pieces.KNIGHT, this.pieces, this.pieceColors, this.pieceImages)
                sounds.pawn_promotion_sound.play()
            }
        }
    }

    restartGameButton() {
        if (Team.whiteWon || Team.blackWon || Team.staleMate) {
            if (this.x >= 4*squareSize + 2*shiftImage && this.x <= 6*squareSize-2*shiftImage
                    && this.y >= boardSize/2 && this.y <= boardSize/2+1.5*squareSize) {

                sounds.game_start_sound.play()
                Team.whiteWon = false
                Team.blackWon = false
                Team.staleMate = false
                Team.turns = 1
                Team.blackKilledPieces = []
                Team.whiteKilledPieces = []
                Score.blackScore = 0
                Score.whiteScore = 0
                King.black_king.hasMoved = false
                King.white_king.hasMoved = false
                Rook.leftBlackRook.hasMoved = false
                Rook.rightBlackRook.hasMoved = false
                Rook.leftWhiteRook.hasMoved = false
                Rook.leftBlackRook.hasMoved = false
                for (let i = 0; i < this.board.length; i++) {
                    this.board[i].x = initialPieces[i].x
                    this.board[i].y = initialPieces[i].y
                    this.board[i].isAlive = true
                    this.pieceColors[i].name = initialPieces[i].name
                    this.pieceImages[i].src = initialPieces[i].src
                }
            }
        }
    }
}
