import whitePawn from '../src/assets/white-pawn.png';
import whiteRook from '../src/assets/white-rook.png';
import whiteQueen from '../src/assets/white-queen.png';
import whiteKnight from '../src/assets/white-knight.png';
import whiteKing from '../src/assets/white-king.png';
import whiteBishop from '../src/assets/white-bishop.png';
import blackPawn from '../src/assets/black-pawn.png';
import blackRook from '../src/assets/black-rook.png';
import blackQueen from '../src/assets/black-queen.png'
import blackKnight from '../src/assets/black-knight.png';
import blackKing from '../src/assets/black-king.png';
import blackBishop from '../src/assets/black-bishop.png';
import restartButton from '../src/assets/restart_button.png'
import restartButtonHover from '../src/assets/restart_button_hover.png'
import soundOn from "../src/assets/sound_on.png"
import soundOff from "../src/assets/sound_off.png"

import moveSound from "../src/Sounds/move.mp3"
import captureSound from "../src/Sounds/capture.mp3"
import castleSound from "../src/Sounds/castle.mp3"
import gameStart from "../src/Sounds/game_start.mp3"
import checkMate from "../src/Sounds/checkmate.mp3"
import staleMate from "../src/Sounds/stalemate.mp3"
import pawnPromotion from "../src/Sounds/pawn_promotion_sound.mp3"
import soundButton from "../src/Sounds/sound_button.mp3"

export const pieceImages = {
    white_pawn: whitePawn,
    white_rook: whiteRook,
    white_queen: whiteQueen,
    white_knight: whiteKnight,
    white_king: whiteKing,
    white_bishop: whiteBishop,
    black_pawn: blackPawn,
    black_rook: blackRook,
    black_queen: blackQueen,
    black_knight: blackKnight,
    black_king: blackKing,
    black_bishop: blackBishop,
}

export const buttonImages = {
    restart_button: restartButton,
    restart_button_hover: restartButtonHover,
    sound_on: soundOn,
    sound_off: soundOff
}

export const sounds = {
    move_sound: new Audio(moveSound),
    capture_sound: new Audio(captureSound),
    castle_sound: new Audio(castleSound),
    game_start_sound: new Audio(gameStart),
    checkmate_sound: new Audio(checkMate),
    stalemate_sound: new Audio(staleMate),
    pawn_promotion_sound: new Audio(pawnPromotion),
    sound_button_sound: new Audio(soundButton),
}

export enum Pieces {
    PAWN = "pawn",
    ROOK = "rook",
    KNIGHT = "knight",
    BISHOP = "bishop",
    QUEEN = "queen",
    KING = "king"
}

export var canvasSize = 600
export var squareSize = canvasSize / 8;
export var imageSize = (squareSize * 2) / 3;
export var shiftImage = (squareSize-imageSize) / 2;
