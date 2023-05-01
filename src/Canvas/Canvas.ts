import {getIndexAtPosition, images, squareSize, imageSize, shiftImage, canvasSize} from "./utils";
import {AlivePiece, ColorPiece, PieceType, Positions} from "./types";
import {Pawn} from "../Pieces/Pawn";

const restart_image = new Image()
restart_image.src = images.restart_button

const restart_image_hover = new Image()
restart_image_hover.src = images.restart_button_hover

export class Canvas{
    ctx: CanvasRenderingContext2D
    restart_image: HTMLImageElement = restart_image
    restart_image_hover: HTMLImageElement = restart_image_hover

    static lastMovedPawn = -1
    static killedPieces: PieceType[] = []
    static whiteWon = false
    static blackWon = false
    static staleMate = false
    static turns = 1

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
            this.ctx.fillStyle = "#7DF9FF"
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

    drawGameOverScreen(mousePosition: Positions){
        let {x,y} = mousePosition
        if (Canvas.whiteWon || Canvas.blackWon || Canvas.staleMate) {
            this.ctx.save();

            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = "#646161";
            this.ctx.fillRect(0, 0, canvasSize, canvasSize);
            this.ctx.globalAlpha = 1;

            this.ctx.font = 'bold 50px Helvetica';
            this.ctx.fillStyle = "#f6f6f6";
            if (Canvas.staleMate) this.ctx.fillText("Stalemate", 180, 250);
            if (Canvas.whiteWon || Canvas.blackWon) this.ctx.fillText("Checkmate!", 162.5, 212.5)
            if (Canvas.whiteWon) this.ctx.fillText("White Won", 175, 275);
            if (Canvas.blackWon) this.ctx.fillText("Black Won", 175, 275);

            const centerX = 3*squareSize + 2*shiftImage
            const centerY = canvasSize / 2;

            this.ctx.drawImage(this.restart_image, centerX, centerY, imageSize * 2, imageSize * 2);
            //Hover effect
            if (x >= 3*squareSize+2*shiftImage && x <= 5*squareSize-2*shiftImage
                && y >= canvasSize/2 && y <= canvasSize/2+1.5*squareSize)
                this.ctx.drawImage(this.restart_image_hover, centerX, centerY, imageSize * 2, imageSize * 2);

            this.ctx.restore();
        }
    }
}
