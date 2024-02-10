import whitePawn from '../assets/white-pawn.png';
import whiteRook from '../assets/white-rook.png';
import whiteQueen from '../assets/white-queen.png';
import whiteKnight from '../assets/white-knight.png';
import whiteKing from '../assets/white-king.png';
import whiteBishop from '../assets/white-bishop.png';
import blackPawn from '../assets/black-pawn.png';
import blackRook from '../assets/black-rook.png';
import blackQueen from '../assets/black-queen.png'
import blackKnight from '../assets/black-knight.png';
import blackKing from '../assets/black-king.png';
import blackBishop from '../assets/black-bishop.png';
import restartButton from '../assets/buttons/restart_button.png'
import restartButtonHover from '../assets/buttons/restart_button_hover.png'
import soundOn from "../assets/buttons/sound_on.png"
import soundOff from "../assets/buttons/sound_off.png"

import moveSound from "../Sounds/move.mp3"
import captureSound from "../Sounds/capture.mp3"
import castleSound from "../Sounds/castle.mp3"
import gameStart from "../Sounds/game_start.mp3"
import checkMate from "../Sounds/checkmate.mp3"
import staleMate from "../Sounds/stalemate.mp3"
import pawnPromotion from "../Sounds/pawn_promotion_sound.mp3"
import soundButton from "../Sounds/sound_button.mp3"

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
