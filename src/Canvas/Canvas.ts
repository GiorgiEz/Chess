import {canvasSize, images, imageSize, shiftImage, squareSize, getIndexAtPosition} from "./utils";
import {AlivePiece, ColorPiece, Positions} from "./types";
import {Pawn} from "../Pieces/Pawn";

export class Canvas{
    ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

   drawGreenCircles = (greenSquares: Positions[]) => {
        for (let pos of greenSquares) {
            const gradient = this.ctx.createRadialGradient(pos.x + 25, pos.y + 25,
                0, pos.x + 25, pos.y + 25, squareSize / 4);
            gradient.addColorStop(0, "#06f67d");
            gradient.addColorStop(1, "#066e52");

            this.ctx.beginPath();
            this.ctx.arc(pos.x + 25, pos.y + 25, squareSize / 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
    }

    drawRedBackground = (redSquares: Positions[]) => {
        for (let pos of redSquares) {
            this.ctx.fillStyle = "#cb0101";
            this.ctx.fillRect(pos.x - 10, pos.y - 10, squareSize - 5, squareSize - 5);
        }
    }

    drawBoardBackground = () => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * squareSize;
                const y = row * squareSize;
                this.ctx.fillStyle = (row + col) % 2 === 0 ? "#1A233B" : "#808080"
                this.ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }

    drawCoordinates = () => {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
        const numbers = [8, 7, 6, 5, 4, 3, 2, 1]
        for (let i = 7; i >= 0; i--){
            this.ctx.font = 'bold 15px Helvetica';
            this.ctx.fillStyle = "#f6f6f6";
            this.ctx.fillText(numbers[i].toString(), shiftImage/8, (squareSize * i) + shiftImage);
            this.ctx.fillText(letters[i], (squareSize * i) + squareSize - shiftImage, canvasSize - shiftImage/4)
        }
    }

    drawPieces = (positions: AlivePiece[], pieceImages: HTMLImageElement[], draggingIndex: number, mousePosition: Positions) => {
        for (let i = 0; i < positions.length; i++) {
            if (positions[i].isAlive) {
                const image = pieceImages[i];
                let {x, y} = positions[i];
                // If the piece is being dragged, draw it at the current mouse position
                if (i === draggingIndex) {
                    x = mousePosition.x;
                    y = mousePosition.y;
                }
                this.ctx.drawImage(image, x, y, imageSize, imageSize);
            }
        }
    }

    hoverEffectForPromotionScreen (mousePosition: Positions){
        let {x,y} = mousePosition
        if (Pawn.promoteScreenOn){
            const gradient = this.ctx.createLinearGradient(0, 0, canvasSize, 0);
            gradient.addColorStop(0, "#7DF9FF");
            gradient.addColorStop(1, "#fd47bf");
            this.ctx.fillStyle = gradient;
            if (x >= 0 && x <= 2*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                this.ctx.fillRect(5, 230, 140, 140);
            } if (x >= 2*squareSize && x <= canvasSize/2 && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                this.ctx.fillRect(155, 230, 140, 140);
            } if (x >= canvasSize/2 && x <= canvasSize-2*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                this.ctx.fillRect(305, 230, 140, 140);
            } if (x >= canvasSize-2*squareSize && x <= canvasSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                this.ctx.fillRect(455, 230, 140, 140);
            }
        }
    }

    drawPromotionScreen(board: Positions[], images: string[], moveY: number, moveX: number, mousePosition: Positions) {
        Pawn.promoteScreenOn = true
        Pawn.promotedPawnIndex = getIndexAtPosition(moveX, moveY, board)
        Pawn.promotedPawns.add(Pawn.promotedPawnIndex)
        this.ctx.fillStyle = "#f3e3c4"
        this.ctx.fillRect(0, 3*squareSize, canvasSize, 2*squareSize);
        this.hoverEffectForPromotionScreen(mousePosition)
        for (let dx = squareSize, i = 0; i < images.length; i++, dx += squareSize*2) {
            const image = new Image();
            image.src = images[i];
            this.ctx.drawImage(image,dx-squareSize+(shiftImage*2),3*squareSize+squareSize/3,imageSize*2,imageSize*2);
        }
    }

    promotionScreen(board: Positions[], pieceColors: ColorPiece[], mousePosition: Positions) {
        const pawn = new Pawn()
        const whiteImages = [images.white_queen, images.white_rook, images.white_bishop, images.white_knight]
        for (let move of pawn.getCurrentPositionsForAllPawns(board, pieceColors).whitePositions) {
            if (move.y <= squareSize && move.y >= 0)
                this.drawPromotionScreen(board, whiteImages, move.y, move.x, mousePosition)
        }
        const blackImages = [images.black_queen, images.black_rook, images.black_bishop, images.black_knight]
        for (let move of pawn.getCurrentPositionsForAllPawns(board, pieceColors).blackPositions) {
            if (move.y <= canvasSize && move.y >= canvasSize - squareSize)
                this.drawPromotionScreen(board, blackImages, move.y, move.x, mousePosition)
        }
    }
}