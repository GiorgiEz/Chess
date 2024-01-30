import {PieceType} from "../types";
import {promotePawnTo, setupChessBoard} from "../utils";
import {Canvas} from "./Canvas";
import {Pawn} from "../Pieces/Pawn";
import {King} from "../Pieces/King";
import {Rook} from "../Pieces/Rook";
import {canvasSize, pieceImages, Pieces, shiftImage, sounds, squareSize} from "../exports";
import {Team} from "../ChessBoard/Team";

export class Button{
    constructor(
        private x: number,
        private y: number,
        private board: PieceType[],
    ) {}

    playButton() {
        if (this.x > canvasSize / 2 - 100 && this.x < canvasSize / 2 + 100 &&
            this.y > canvasSize / 2 - shiftImage && this.y < canvasSize / 2 - shiftImage + 100 && Canvas.menuScreen
        ) {
            sounds.sound_button_sound.play();
            Canvas.menuScreen = false
        }
    }

    toggleSoundButton() {
        if (this.x > 0 && this.x < squareSize && this.y > 0 && this.y < squareSize
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
        if (this.board[Pawn.promotedPawnIndex]?.name === Pieces.PAWN) {
            if (this.x >= 0 && this.x <= 2*squareSize && this.y >= 3*squareSize && this.y <= canvasSize-3*squareSize) {
                if (this.board[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(pieceImages.white_queen, Pieces.QUEEN, this.board)
                else promotePawnTo(pieceImages.black_queen, Pieces.QUEEN, this.board)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= 2*squareSize && this.x <= 4*squareSize && this.y >= 3*squareSize && this.y <= canvasSize-3*squareSize) {
                if (this.board[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(pieceImages.white_rook, Pieces.ROOK, this.board)
                else promotePawnTo(pieceImages.black_rook, Pieces.ROOK, this.board)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= 4*squareSize && this.x <= squareSize*6 && this.y >= 3*squareSize && this.y <= canvasSize-3*squareSize) {
                if (this.board[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(pieceImages.white_bishop, Pieces.BISHOP, this.board)
                else promotePawnTo(pieceImages.black_bishop, Pieces.BISHOP, this.board)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= squareSize*6 && this.x <= squareSize*8 && this.y >= 3*squareSize && this.y <= canvasSize-3*squareSize) {
                if (this.board[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(pieceImages.white_knight, Pieces.KNIGHT, this.board)
                else promotePawnTo(pieceImages.black_knight, Pieces.KNIGHT, this.board)
                sounds.pawn_promotion_sound.play()
            }
        }
    }

    restartGameButton() {
        if (Team.whiteWon || Team.blackWon || Team.staleMate) {
            if (this.x >= 3*squareSize + 2*shiftImage && this.x <= 5*squareSize-2*shiftImage
                    && this.y >= canvasSize/2 && this.y <= canvasSize/2+1.5*squareSize) {

                sounds.game_start_sound.play()
                Team.whiteWon = false
                Team.blackWon = false
                Team.staleMate = false
                Team.turns = 1
                King.black_king.hasMoved = false
                King.white_king.hasMoved = false
                Rook.leftBlackRook.hasMoved = false
                Rook.rightBlackRook.hasMoved = false
                Rook.leftWhiteRook.hasMoved = false
                Rook.leftBlackRook.hasMoved = false
                Pawn.lastMovedPawnIndex = -1
                Pawn.promotedPawnIndex = -1

                const initialPieces = setupChessBoard()

                for (let i = 0; i < this.board.length; i++) {
                    this.board[i].x = initialPieces[i].x
                    this.board[i].y = initialPieces[i].y
                    this.board[i].name = initialPieces[i].name
                    this.board[i].image = initialPieces[i].image
                }
            }
        }
    }
}
