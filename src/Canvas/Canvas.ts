import {AlivePiece, ColorPiece, PieceType, Positions} from "../types";
import {Pawn} from "../Pieces/Pawn";
import {getCurrentPositionsForAllPawns} from "../Pieces/AllMoves";
import {getIndexAtPosition} from "./utils";
import {images, squareSize, imageSize, shiftImage, boardHeight, canvasWidth} from "../exports";
import {King} from "../Pieces/King";

const restart_image = new Image()
restart_image.src = images.restart_button

const restart_image_hover = new Image()
restart_image_hover.src = images.restart_button_hover

const sound_on = new Image()
sound_on.src = images.sound_on

const sound_off = new Image()
sound_off.src = images.sound_off

export class Canvas{
    ctx: CanvasRenderingContext2D
    restart_image = restart_image
    restart_image_hover = restart_image_hover
    sound_on = sound_on
    sound_off = sound_off

    static whiteScore = 0
    static blackScore = 0
    static lastMovedPawnIndex = -1
    static whiteWon = false
    static blackWon = false
    static staleMate = false
    static menuScreen = false
    static soundOn = true;
    static turns = 1
    static blackKilledPieces: PieceType[] = []
    static whiteKilledPieces: PieceType[] = []

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, canvasWidth, boardHeight+75);
    }

   drawGreenCircles = (greenSquares: Positions[]) => {
        for (let pos of greenSquares) {
            const gradient = this.ctx.createRadialGradient(pos.x + 25, pos.y + 25,
                0, pos.x + 25, pos.y + 25, squareSize / 4);
            gradient.addColorStop(0, "#e0eee7");
            gradient.addColorStop(1, "#e6efed");

            this.ctx.save(); // save the canvas context state
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowOffsetX = 5;
            this.ctx.shadowOffsetY = 5;

            this.ctx.beginPath();
            this.ctx.arc(pos.x + 25, pos.y + 25, squareSize / 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            this.ctx.restore(); // restore the canvas context state

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
                const x = col * squareSize + squareSize;
                const y = row * squareSize
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
            this.ctx.fillText(numbers[i].toString(), shiftImage/3+squareSize, (squareSize * i) + shiftImage);
            this.ctx.fillText(letters[i], (squareSize * i) + 2*squareSize - shiftImage/2, boardHeight - shiftImage/4)
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
                this.ctx.save();
                this.ctx.shadowColor = "#000000";
                this.ctx.shadowOffsetX = 5;
                this.ctx.shadowOffsetY = 5;
                this.ctx.drawImage(image, x, y, imageSize, imageSize);
                this.ctx.restore();
            }
        }
    }

    displayScoreAndNames(whiteKingName: string, blackKingName: string, pieceImages: HTMLImageElement[]){
        if (!Canvas.menuScreen) {
            this.ctx.font = 'bold 50px Future';
            this.ctx.fillStyle = "#100f0f";
            this.ctx.textAlign = "center"
            this.ctx.drawImage(pieceImages[King.white_king.index], 230, 610, imageSize+shiftImage, imageSize+shiftImage);
            this.ctx.drawImage(pieceImages[King.black_king.index], 455, 610, imageSize+shiftImage, imageSize+shiftImage);
            this.ctx.fillText(Canvas.whiteScore.toString().padStart(2, "0") +
                " - " + Canvas.blackScore.toString().padStart(2, "0"), 375, 660);

            this.ctx.font = 'bold 15px Future';
            this.ctx.fillStyle = "#100f0f";
            this.ctx.fillText(whiteKingName.toUpperCase(), 125, 660);
            this.ctx.fillText(blackKingName.toUpperCase(), 620, 660);
        }
    }

    drawKilledPieces(){
        for (let i = 0; i < Canvas.blackKilledPieces.length; i++){
            const image = new Image()
            image.src = Canvas.blackKilledPieces[i].src
            this.ctx.drawImage(image, 680, 40.5 * i, 30, 30)
        }
        for (let i = 0; i < Canvas.whiteKilledPieces.length; i++){
            const image = new Image()
            image.src = Canvas.whiteKilledPieces[i].src
            this.ctx.drawImage(image, 30, 40.5 * i, 30, 30)
        }
    }

    shadowEffect(x: number, y: number, w: number, h: number){
        this.ctx.save()
        this.ctx.shadowColor = "#000000";
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;
        this.ctx.shadowBlur = 20;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.restore()
    }

    hoverEffectForPromotionScreen (mousePosition: Positions){
        let {x,y} = mousePosition
        if (Pawn.promoteScreenOn){
            if (x >= squareSize && x <= 3*squareSize && y >= 3*squareSize && y <= boardHeight-3*squareSize) {
                this.shadowEffect(80, 230, 140, 140)
            } if (x >= 3*squareSize && x <= canvasWidth/2 && y >= 3*squareSize && y <= boardHeight-3*squareSize) {
                this.shadowEffect(230, 230, 140, 140)
            } if (x >= canvasWidth/2 && x <= canvasWidth/2+squareSize*2 && y >= 3*squareSize && y <= boardHeight-3*squareSize) {
                this.shadowEffect(380, 230, 140, 140)
            } if (x >= canvasWidth/2+squareSize*2 && x <= canvasWidth-squareSize && y >= 3*squareSize && y <= boardHeight-3*squareSize) {
                this.shadowEffect(530, 230, 140, 140)
            }
        }
    }

    drawPromotionScreen(board: Positions[], images: string[], moveY: number, moveX: number, mousePosition: Positions) {
        Pawn.promoteScreenOn = true
        Pawn.promotedPawnIndex = getIndexAtPosition(moveX, moveY, board)
        Pawn.promotedPawns.add(Pawn.promotedPawnIndex)
        this.ctx.fillStyle = "#dcc27a"
        this.ctx.fillRect(squareSize, 3*squareSize, boardHeight, 2*squareSize);
        this.hoverEffectForPromotionScreen(mousePosition)
        for (let dx = squareSize, i = 0; i < images.length; i++, dx += squareSize*2) {
            const image = new Image();
            image.src = images[i];
            this.ctx.drawImage(image,dx+2*shiftImage,3*squareSize+squareSize/3,imageSize*2,imageSize*2);
        }
    }

    promotionScreen(board: Positions[], pieceColors: ColorPiece[], mousePosition: Positions) {
        const whiteImages = [images.white_queen, images.white_rook, images.white_bishop, images.white_knight]
        for (let move of getCurrentPositionsForAllPawns(board, pieceColors).whitePositions) {
            if (move.y <= squareSize && move.y >= 0)
                this.drawPromotionScreen(board, whiteImages, move.y, move.x, mousePosition)
        }
        const blackImages = [images.black_queen, images.black_rook, images.black_bishop, images.black_knight]
        for (let move of getCurrentPositionsForAllPawns(board, pieceColors).blackPositions) {
            if (move.y <= boardHeight && move.y >= boardHeight - squareSize)
                this.drawPromotionScreen(board, blackImages, move.y, move.x, mousePosition)
        }
    }

    drawGameOverScreen(mousePosition: Positions){
        if (Canvas.whiteWon || Canvas.blackWon || Canvas.staleMate) {
            this.ctx.save();
            let {x,y} = mousePosition

            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = "#646161";
            this.ctx.fillRect(squareSize, 0, boardHeight, boardHeight);
            this.ctx.globalAlpha = 1;

            this.ctx.save();
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 3;
            this.ctx.font = 'bold 50px Helvetica';
            this.ctx.fillStyle = "#f6f6f6";
            this.ctx.textAlign = "center"

            if (Canvas.staleMate) this.ctx.fillText("Stalemate", 375, 250);
            else this.ctx.fillText("Checkmate!", 375, 212.5)
            if (Canvas.whiteWon) this.ctx.fillText("White Won", 375, 275);
            else if (Canvas.blackWon) this.ctx.fillText("Black Won", 375, 275);
            this.ctx.restore();

            const centerX = 4*squareSize + 2*shiftImage
            const centerY = boardHeight / 2;

            this.ctx.drawImage(this.restart_image, centerX, centerY, imageSize * 2, imageSize * 2);
            //Hover effect
            if (x >= 4*squareSize + 2*shiftImage && x <= 6*squareSize-2*shiftImage
                && y >= boardHeight/2 && y <= boardHeight/2+1.5*squareSize)
                this.ctx.drawImage(this.restart_image_hover, centerX, centerY, imageSize * 2, imageSize * 2);
            this.ctx.restore();
        }
    }

    drawMenuScreen(){
        if (Canvas.menuScreen){
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillStyle = "#484545";
            this.ctx.fillRect(squareSize, 0, boardHeight, boardHeight);
            this.ctx.globalAlpha = 1;
        }
    }

    drawSoundButton(mousePosition: Positions){
        if (Canvas.menuScreen || Canvas.menuScreen || Canvas.whiteWon || Canvas.blackWon || Canvas.staleMate){
            let {x,y} = mousePosition
            this.ctx.beginPath();
            this.ctx.arc(95, 20, 20, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fill();

            if (x >= squareSize && x <= squareSize+squareSize/2 && y >= 0 && y <= squareSize/2 && Canvas.menuScreen) {
                this.ctx.beginPath();
                this.ctx.arc(95, 20, 20, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#c6ccc6';
                this.ctx.fill();
            }

            this.ctx.drawImage(Canvas.soundOn ? this.sound_on : this.sound_off,82.5,7.5, imageSize/2, imageSize/2);
        }
    }
}
