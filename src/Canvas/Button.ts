import {AlivePiece, ColorPiece, PieceType, Positions} from "../types";
import {promotePawnTo} from "./utils";
import {initialBoard} from "../ChessBoard/ChessBoard";
import {Canvas} from "./Canvas";
import {Pawn} from "../Pieces/Pawn";
import {King} from "../Pieces/King";
import {Rook} from "../Pieces/Rook";
import {boardHeight, canvasWidth, images, shiftImage, sounds, squareSize} from "../exports";

export class Button {
    x: number
    y: number

    constructor(mousePosition: Positions) {
        this.x = mousePosition.x
        this.y = mousePosition.y
    }

    toggleSoundButton() {
        if (this.x >= squareSize && this.x <= squareSize+squareSize/2 && this.y >= 0 && this.y <= squareSize/2
            && (Canvas.menuScreen || Canvas.whiteWon || Canvas.blackWon || Canvas.staleMate)){
            Canvas.soundOn = !Canvas.soundOn;
            sounds.move_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.capture_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.castle_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.checkmate_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.stalemate_sound.volume = Canvas.soundOn ? 1 : 0;
            sounds.game_start_sound.volume = Canvas.soundOn ? 1 : 0;
        }
    }

    promotePawnButtons(pieceColors: ColorPiece[], pieces: PieceType[], pieceImages: HTMLImageElement[]) {
        if (pieceColors[Pawn.promotedPawnIndex]?.name === "pawn") {
            if (this.x >= squareSize && this.x <= 3*squareSize &&
                this.y >= 3*squareSize && this.y <= boardHeight-3*squareSize) {
                if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(images.white_queen, "queen", pieces, pieceColors, pieceImages)
                else promotePawnTo(images.black_queen, "queen", pieces, pieceColors, pieceImages)
            } if (this.x >= 3*squareSize && this.x <= canvasWidth/2 &&
                this.y >= 3*squareSize && this.y <= boardHeight-3*squareSize) {
                if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(images.white_rook, "rook", pieces, pieceColors, pieceImages)
                else promotePawnTo(images.black_rook, "rook", pieces, pieceColors, pieceImages)
            } if (this.x >= canvasWidth/2 && this.x <= canvasWidth/2+squareSize*2 &&
                this.y >= 3*squareSize && this.y <= boardHeight-3*squareSize) {
                if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(images.white_bishop, "bishop", pieces, pieceColors, pieceImages)
                else promotePawnTo(images.black_bishop, "bishop", pieces, pieceColors, pieceImages)
            } if (this.x >= canvasWidth/2+squareSize*2 && this.x <= canvasWidth-squareSize &&
                this.y >= 3*squareSize && this.y <= boardHeight-3*squareSize) {
                if (pieceColors[Pawn.promotedPawnIndex].color === "white")
                    promotePawnTo(images.white_knight, "knight", pieces, pieceColors, pieceImages)
                else promotePawnTo(images.black_knight, "knight", pieces, pieceColors, pieceImages)
            }
            sounds.pawn_promotion_sound.play()
        }
    }

    restartGameButton(board: AlivePiece[], pieceColors: ColorPiece[], pieceImages: HTMLImageElement[]) {
        if (Canvas.whiteWon || Canvas.blackWon || Canvas.staleMate) {
            if (this.x >= 4*squareSize + 2*shiftImage && this.x <= 6*squareSize-2*shiftImage
                && this.y >= boardHeight/2 && this.y <= boardHeight/2+1.5*squareSize) {
                sounds.game_start_sound.play()
                Canvas.whiteWon = false
                Canvas.blackWon = false
                Canvas.staleMate = false
                Canvas.turns = 1
                Canvas.blackKilledPieces = []
                Canvas.whiteKilledPieces = []
                Canvas.blackScore = 0
                Canvas.whiteScore = 0
                King.black_king.hasMoved = false
                King.white_king.hasMoved = false
                Rook.leftBlackRook.hasMoved = false
                Rook.rightBlackRook.hasMoved = false
                Rook.leftWhiteRook.hasMoved = false
                Rook.leftBlackRook.hasMoved = false
                for (let i = 0; i < board.length; i++) {
                    board[i].x = initialBoard[i].x
                    board[i].y = initialBoard[i].y
                    board[i].isAlive = true
                    pieceColors[i].name = initialBoard[i].name
                    pieceImages[i].src = initialBoard[i].src
                }
            }
        }
    }
}