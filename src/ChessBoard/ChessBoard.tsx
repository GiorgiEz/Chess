import {PieceType} from "../types";
import {MovePieces} from "./MovePieces"
import {pieceImages, shiftImage, squareSize} from "../exports";
import React, {ChangeEvent, useCallback, useState} from "react";
import {NamesInput} from "../InputForm/NamesInput";

const pieces: PieceType[] = []
export const initialPieces: PieceType[] = []

const blackPieces = [
    pieceImages.black_rook, pieceImages.black_knight, pieceImages.black_bishop, pieceImages.black_queen,
    pieceImages.black_king, pieceImages.black_bishop, pieceImages.black_knight, pieceImages.black_rook
]
const whitePieces = [
    pieceImages.white_rook, pieceImages.white_knight, pieceImages.white_bishop, pieceImages.white_queen,
    pieceImages.white_king, pieceImages.white_bishop, pieceImages.white_knight, pieceImages.white_rook
]

const namesArray = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

for (let pos = squareSize + shiftImage, i = 0; i < blackPieces.length; pos += squareSize, i++) {
    pieces.push({src: blackPieces[i], x: pos, y: 12.5, color: "black", name: namesArray[i], isAlive: true})
    pieces.push({src: pieceImages.black_pawn, x: pos, y: 87.5, color: "black", name:"pawn", isAlive: true})
    pieces.push({src: pieceImages.white_pawn, x: pos, y: 462.5, color: "white", name:"pawn", isAlive: true})
    pieces.push({src: whitePieces[i], x: pos, y: 537.5, color: "white", name: namesArray[i], isAlive: true})

    initialPieces.push({src: blackPieces[i], x: pos, y: 12.5, color: "black", name: namesArray[i], isAlive: true})
    initialPieces.push({src: pieceImages.black_pawn, x: pos, y: 87.5, color: "black", name:"pawn", isAlive: true})
    initialPieces.push({src: pieceImages.white_pawn, x: pos, y: 462.5, color: "white", name:"pawn", isAlive: true})
    initialPieces.push({src: whitePieces[i], x: pos, y: 537.5, color: "white", name: namesArray[i], isAlive: true})
}

export const ChessBoard = () => {
    const [whiteKingName, setWhiteKingName] = useState("")
    const [blackKingName, setBlackKingName] = useState("")

    const handleWhiteKingInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setWhiteKingName(event.target.value);
    }, [])

    const handleBlackKingInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setBlackKingName(event.target.value);
    }, [])

    return (
        <div>
            <MovePieces pieces={pieces} whiteKingName={whiteKingName} blackKingName={blackKingName}/>
            <NamesInput
                handleBlackKingInput={handleBlackKingInput}
                handleWhiteKingInput={handleWhiteKingInput}
            />
        </div>
    )
}
