import {PieceType, Positions} from "../Utils/types";
import Game from "../Game/Game";
import {Pieces} from "../Utils/exports";
import {Rook} from "./Rook";
import {isPieceOnSquare} from "../Utils/utilFunctions";
import {allPotentialMoves} from "./ValidMoves";

export class King{
    private game: Game;
    static hasWhiteKingMoved = false
    static hasBlackKingMoved = false

    constructor() {
        this.game = Game.getInstance();
    }

    static getWhiteKing(chessboard: PieceType[]) {
        return chessboard.filter((king: PieceType) => king.color === "white" && king.name === Pieces.KING)[0]
    }

    static getBlackKing(chessboard: PieceType[]) {
        return chessboard.filter((king: PieceType) => king.color === "black" && king.name === Pieces.KING)[0]
    }

    validMoves(piece: PieceType, chessboard: PieceType[]): Positions[] {
        const {x,y} = piece
        const left = {
            x: x - this.game.squareSize, y: y,
        }
        const right = {
            x: x + this.game.squareSize, y: y,
        }
        const down = {
            x: x, y: y - this.game.squareSize,
        }
        const up = {
            x: x, y: y + this.game.squareSize,
        }
        const downLeft = {
            x: x - this.game.squareSize, y: y - this.game.squareSize,
        }
        const downRight = {
            x: x + this.game.squareSize, y: y - this.game.squareSize,
        }
        const upLeft = {
            x: x - this.game.squareSize, y: y + this.game.squareSize,
        }
        const upRight = {
            x: x + this.game.squareSize, y: y + this.game.squareSize,
        }

        let validMoves = [left, right, down, up, downLeft, downRight, upLeft, upRight]

        const rightTwoSquares = {
            x: x + 2 * this.game.squareSize, y
        }

        const leftTwoSquares = {
            x: x - 2 * this.game.squareSize, y
        }

        // check if castling is possible
        if (piece.color === "white"){
            if(!King.hasWhiteKingMoved && !Rook.hasLeftWhiteRookMoved){
                this.checkCastlingForLeftRook(piece, left, leftTwoSquares, validMoves)
            }
            if(!King.hasWhiteKingMoved && !Rook.hasRightWhiteRookMoved){
                this.checkCastlingForRightRook(piece, right, rightTwoSquares, validMoves)
            }
        } else {
            if(!King.hasBlackKingMoved && !Rook.hasLeftBlackRookMoved){
                this.checkCastlingForLeftRook(piece, left, leftTwoSquares, validMoves)
            }
            if(!King.hasBlackKingMoved && !Rook.hasRightBlackRookMoved){
                this.checkCastlingForRightRook(piece, right, rightTwoSquares, validMoves)
            }
        }
        return this.game.getValidMovesForKnightOrKing(piece, validMoves, chessboard)
    }

    checkCastlingForLeftRook(piece: PieceType, left: Positions, leftTwoSquares: Positions, validMoves: Positions[]){
        const leftThreeSquares = {x: piece.x - 3 * this.game.squareSize, y: piece.y}
        const leftFourSquares = {x: piece.x - 4 * this.game.squareSize, y: piece.y}
        if (this.isCastlingPossible(piece, {x: piece.x, y: piece.y}, left, leftTwoSquares, leftThreeSquares, leftFourSquares) &&
            !isPieceOnSquare(left.x, left.y) && !isPieceOnSquare(leftTwoSquares.x, leftTwoSquares.y) &&
            !isPieceOnSquare(leftThreeSquares.x, leftThreeSquares.y))
        {
            validMoves.push(leftTwoSquares)
        }
    }

    checkCastlingForRightRook(piece: PieceType, right: Positions, rightTwoSquares: Positions, validMoves: Positions[]){
        const rightThreeSquares = {x: piece.x + 3 * this.game.squareSize, y: piece.y}
        if (this.isCastlingPossible(piece, {x: piece.x, y: piece.y}, right, rightTwoSquares, rightThreeSquares) &&
            !isPieceOnSquare(right.x, right.y) && !isPieceOnSquare(rightTwoSquares.x, rightTwoSquares.y))
        {
            validMoves.push(rightTwoSquares)
        }
    }

    getEnemiesMoves(piece: PieceType){
        const {whiteValidMoves, blackValidMoves} = allPotentialMoves(this.game.chessboard, true)
        return piece.color === "white" ? blackValidMoves : whiteValidMoves
    }

    isCastlingPossible(piece: PieceType, ...positions: Positions[]): boolean {
        const enemyMoves = this.getEnemiesMoves(piece);
        const isPositionInEnemyMoves = positions.some(position => {
            return enemyMoves.some(enemyMove => enemyMove.x === position.x && enemyMove.y === position.y);
        });
        return !isPositionInEnemyMoves;
    }
}
