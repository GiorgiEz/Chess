import {promotePawnTo} from "../Utils/utilFunctions";
import {King} from "../Pieces/King";
import {Rook} from "../Pieces/Rook";
import {pieceImages, Pieces, sounds} from "../Utils/exports";
import Game from "../Game/Game";

export class Button {
    private game: Game;

    constructor(
        private x: number,
        private y: number,
    ) {
        this.game = Game.getInstance();
    }

    playButton() {
        const w = 2*this.game.squareSize + this.game.squareSize/2
        const h = this.game.squareSize

        const start_x = this.game.canvasSize/2 - w/2
        const start_y = this.game.canvasSize/2 - h/2

        if (this.x > start_x && this.x < start_x + w && this.y > start_y && this.y < start_y + h && this.game.isMenuScreenOn){
            sounds.sound_button_sound.play();
            this.game.isMenuScreenOn = false
        }
    }

    toggleSoundButton() {
        if (this.x > 0 && this.x < this.game.squareSize && this.y > 0 && this.y < this.game.squareSize
            && (this.game.isMenuScreenOn || this.game.whiteWon || this.game.blackWon || this.game.staleMate)){
            sounds.sound_button_sound.play()
            this.game.isSoundOn = !this.game.isSoundOn;
            sounds.move_sound.volume = this.game.isSoundOn ? 1 : 0;
            sounds.capture_sound.volume = this.game.isSoundOn ? 1 : 0;
            sounds.castle_sound.volume = this.game.isSoundOn ? 1 : 0;
            sounds.checkmate_sound.volume = this.game.isSoundOn ? 1 : 0;
            sounds.stalemate_sound.volume = this.game.isSoundOn ? 1 : 0;
            sounds.game_start_sound.volume = this.game.isSoundOn ? 1 : 0;
            sounds.pawn_promotion_sound.volume = this.game.isSoundOn ? 1: 0;
        }
    }

    promotePawnButtons() {
        if (this.game.promotedPawn && this.game.promotedPawn.name === Pieces.PAWN) {
            if (this.x >= 0 && this.x <= 2*this.game.squareSize && this.y >= 3*this.game.squareSize &&
                this.y <= this.game.canvasSize-3*this.game.squareSize){
                if (this.game.promotedPawn.color === "white") {
                    promotePawnTo(pieceImages.white_queen, Pieces.QUEEN)
                }
                else promotePawnTo(pieceImages.black_queen, Pieces.QUEEN)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= 2*this.game.squareSize && this.x <= 4*this.game.squareSize &&
                this.y >= 3*this.game.squareSize && this.y <= this.game.canvasSize-3*this.game.squareSize) {
                if (this.game.promotedPawn.color === "white")
                    promotePawnTo(pieceImages.white_rook, Pieces.ROOK)
                else promotePawnTo(pieceImages.black_rook, Pieces.ROOK)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= 4*this.game.squareSize && this.x <= this.game.squareSize*6 && this.y >= 3*this.game.squareSize &&
                this.y <= this.game.canvasSize-3*this.game.squareSize) {
                if (this.game.promotedPawn.color === "white")
                    promotePawnTo(pieceImages.white_bishop, Pieces.BISHOP)
                else promotePawnTo(pieceImages.black_bishop, Pieces.BISHOP)
                sounds.pawn_promotion_sound.play()
            } if (this.x >= this.game.squareSize*6 && this.x <= this.game.squareSize*8 && this.y >= 3*this.game.squareSize &&
                this.y <= this.game.canvasSize-3*this.game.squareSize) {
                if (this.game.promotedPawn.color === "white")
                    promotePawnTo(pieceImages.white_knight, Pieces.KNIGHT)
                else promotePawnTo(pieceImages.black_knight, Pieces.KNIGHT)
                sounds.pawn_promotion_sound.play()
            }
        }
    }

    restartGameButton() {
        if (this.game.whiteWon || this.game.blackWon || this.game.staleMate) {
            if (this.x >= 3*this.game.squareSize + 2*this.game.shiftImage && this.x <= 5*this.game.squareSize-2*this.game.shiftImage
                    && this.y >= this.game.canvasSize/2 && this.y <= this.game.canvasSize/2+1.5*this.game.squareSize) {

                sounds.game_start_sound.play()
                this.game.whiteWon = false
                this.game.blackWon = false
                this.game.staleMate = false
                this.game.turns = 1
                King.hasWhiteKingMoved = false
                King.hasBlackKingMoved = false
                Rook.hasLeftBlackRookMoved = false
                Rook.hasRightBlackRookMoved = false
                Rook.hasLeftWhiteRookMoved = false
                Rook.hasRightWhiteRookMoved = false
                this.game.promotedPawn = null
                this.game.chessboard = this.game.setupChessBoard()
            }
        }
    }
}
