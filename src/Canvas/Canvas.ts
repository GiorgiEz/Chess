import {Positions} from "../Utils/types";
import {comparePositions, createImage, getPieceAtPosition} from "../Utils/utilFunctions";
import {pieceImages, buttonImages, Pieces} from "../Utils/exports";
import Game from "../Game/Game";

const canvasImages = {
    restart_image: createImage(buttonImages.restart_button),
    restart_image_hover: createImage(buttonImages.restart_button_hover),
    sound_on: createImage(buttonImages.sound_on),
    sound_off: createImage(buttonImages.sound_off),
}

export class Canvas{
    private game: Game;

    constructor(
        private ctx: CanvasRenderingContext2D,
    ) {
        this.game = Game.getInstance();
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.game.canvasSize, this.game.canvasSize);
    }

    drawPlayButton() {
        if (this.game.isMenuScreenOn) {
            const { x, y } = this.game.mousePosition;

            const w = 2*this.game.squareSize + this.game.squareSize/2
            const h = this.game.squareSize

            const start_x = this.game.canvasSize/2 - w/2
            const start_y = this.game.canvasSize/2 - h/2


            this.ctx.fillStyle = "#808080";
            this.ctx.fillRect(start_x, start_y, w, h);

            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = `${this.game.squareSize}px Arial`;
            this.ctx.fillText("PLAY", start_x, start_y + this.game.squareSize - this.game.shiftImage);

            if (x > start_x && x < start_x + w && y > start_y && y < start_y + h) {
                this.ctx.fillStyle = "rgb(128,128,128, 0.2)";
                this.ctx.fillRect(start_x, start_y, w, h);
            }
        }
    }

    drawHighlightingCircles() {
        if (!this.game.highlightedMoves) return
        for (let pos of this.game.highlightedMoves) {
            const gradient = this.ctx.createRadialGradient(pos.x + 25, pos.y + 25,
                0, pos.x + 25, pos.y + 25, this.game.squareSize / 4);
            gradient.addColorStop(0, "#e0eee7");
            gradient.addColorStop(1, "#e6efed");

            this.ctx.save();
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowOffsetX = 5;
            this.ctx.shadowOffsetY = 5;

            this.ctx.beginPath();
            this.ctx.arc(pos.x + this.game.squareSize/3, pos.y + this.game.squareSize/3,
                this.game.squareSize / 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    drawThreatenedSquares() {
        for (let pos of this.game.threatenedSquares) {
            this.ctx.fillStyle = "#cb0101";
            this.ctx.fillRect(pos.x - this.game.squareSize/12, pos.y - this.game.squareSize/12,
            this.game.imageSize + this.game.shiftImage, this.game.imageSize + this.game.shiftImage);
        }
    }

    drawBoardBackground() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * this.game.squareSize;
                const y = row * this.game.squareSize
                this.ctx.fillStyle = (row + col) % 2 === 0 ? "#1A233B" : "#808080"
                this.ctx.fillRect(x, y, this.game.squareSize, this.game.squareSize);
            }
        }
    }

    drawCoordinates() {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
        const numbers = ["8", "7", "6", "5", "4", "3", "2", "1"]
        for (let i = 7; i >= 0; i--){
            this.ctx.font = `bold ${this.game.squareSize/5}px Helvetica`;
            this.ctx.fillStyle = "#f6f6f6";
            this.ctx.fillText(numbers[i], 2, (this.game.squareSize * i) + this.game.shiftImage);
            this.ctx.fillText(letters[i], (this.game.squareSize * i)+2, this.game.canvasSize+2 - this.game.shiftImage/2)
        }
    }

    drawPieces() {
        for (let piece of this.game.chessboard) {
            if (piece.x > 0) {
                const image = piece.image;
                let {x, y} = piece;
                // If the piece is being dragged, draw it at the current mouse position
                if (this.game.draggingPiece && piece.index === this.game.draggingPiece.index) {
                    x = this.game.mousePosition.x - this.game.squareSize / 3;
                    y = this.game.mousePosition.y - this.game.squareSize / 3;
                }
                this.ctx.drawImage(image, x, y, this.game.imageSize, this.game.imageSize);
            }
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

    hoverEffectForPromotionScreen(){
        let {x,y} = this.game.mousePosition
        if (this.game.isPromotionScreenOn){
            const size = this.game.canvasSize/4 - this.game.shiftImage/4
            const y_min = 3*this.game.squareSize
            const y_max = this.game.canvasSize/2 + this.game.squareSize
            const x_min = this.game.squareSize
            const x_max = this.game.squareSize

            if (x >= this.game.shiftImage/4 && x <= 2*x_max && y >= y_min && y <= y_max) {
                this.shadowEffect(this.game.shiftImage/4 , y_min, size, size)
            } if (x >= 2*x_min && x <= 4*x_max && y >= y_min && y <= y_max) {
                this.shadowEffect(x_min*2, y_min, size, size)
            } if (x >= 4*x_min && x <= 6*x_max && y >= y_min && y <= y_max) {
                this.shadowEffect(x_min*4, y_min, size, size)
            } if (x >= 6*x_min && x <= 8*x_max && y >= y_min && y <= y_max){
                this.shadowEffect(x_min*6 - this.game.shiftImage/4, y_min, size, size)
            }
        }
    }

    drawPromotionScreen(images: string[], moveY: number, moveX: number) {
        this.game.isPromotionScreenOn = true
        this.game.promotedPawn = {...getPieceAtPosition(moveX, moveY)!}
        this.ctx.fillStyle = "#ffffff"
        this.ctx.fillRect(0, 3*this.game.squareSize, this.game.canvasSize, 2*this.game.squareSize);
        this.hoverEffectForPromotionScreen()
        for (let dx = 0, i = 0; i < images.length; i++, dx += this.game.squareSize*2) {
            const image = new Image();
            image.src = images[i];
            this.ctx.drawImage(image,dx+2*this.game.shiftImage,3*this.game.squareSize+this.game.squareSize/3,this.game.imageSize*2,this.game.imageSize*2);
        }
    }

    promotionScreen() {
        const whiteImages = [pieceImages.white_queen, pieceImages.white_rook, pieceImages.white_bishop, pieceImages.white_knight]
        let whitePawnPositions: Positions[] | undefined = this.game.chessboard
            ?.filter((piece) => piece.color === "white" && piece.name === Pieces.PAWN)
            ?.map((pawn) => ({ x: pawn.x, y: pawn.y }));

        for (let move of whitePawnPositions) {
            if (move.y <= this.game.squareSize && move.y >= 0) {
                this.drawPromotionScreen(whiteImages, move.y, move.x)
            }
        }
        const blackImages = [pieceImages.black_queen, pieceImages.black_rook, pieceImages.black_bishop, pieceImages.black_knight]
        let blackPawnPositions: Positions[] | undefined = this.game.chessboard
            ?.filter((piece) => piece.color === "black" && piece.name === Pieces.PAWN)
            ?.map((pawn) => ({ x: pawn.x, y: pawn.y }));

        for (let move of blackPawnPositions) {
            if (move.y <= this.game.canvasSize && move.y >= this.game.canvasSize - this.game.squareSize) {
                this.drawPromotionScreen(blackImages, move.y, move.x)
            }
        }
    }

    drawGameOverScreen(){
        if (this.game.whiteWon || this.game.blackWon || this.game.staleMate) {
            this.ctx.save();
            let {x,y} = this.game.mousePosition

            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = "#646161";
            this.ctx.fillRect(0, 0, this.game.canvasSize, this.game.canvasSize);
            this.ctx.globalAlpha = 1;

            this.ctx.save();
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 3;
            this.ctx.font = `bold ${this.game.imageSize}px Helvetica`;
            this.ctx.fillStyle = "#f6f6f6";
            this.ctx.textAlign = "center"

            if (this.game.staleMate) {
                this.ctx.fillText("Stalemate", this.game.canvasSize/2, this.game.imageSize*5);
            }
            else {
                this.ctx.fillText("Checkmate!", this.game.canvasSize/2, this.game.imageSize*4 + this.game.shiftImage)
            }
            if (this.game.whiteWon) {
                this.ctx.fillText(`White Won`, this.game.canvasSize/2, this.game.imageSize*5 + this.game.shiftImage*2);
            }
            else if (this.game.blackWon) {
                this.ctx.fillText(`Black Won`, this.game.canvasSize/2, this.game.imageSize*5 + this.game.shiftImage*2);
            }
            this.ctx.restore();

            const centerX = 3*this.game.squareSize + 2*this.game.shiftImage
            const centerY = this.game.canvasSize / 2;

            this.ctx.drawImage(canvasImages.restart_image, centerX, centerY, this.game.imageSize * 2, this.game.imageSize * 2);
            //Hover effect
            if (x >= 3*this.game.squareSize + 2*this.game.shiftImage && x <= 5*this.game.squareSize-2*this.game.shiftImage
                && y >= this.game.canvasSize/2 && y <= this.game.canvasSize/2+1.5*this.game.squareSize)
                this.ctx.drawImage(canvasImages.restart_image_hover, centerX, centerY, this.game.imageSize * 2, this.game.imageSize * 2);
            this.ctx.restore();
        }
    }

    drawMenuScreen(){
        if (this.game.isMenuScreenOn){
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillStyle = "#484545";
            this.ctx.fillRect(0, 0, this.game.canvasSize, this.game.canvasSize);
            this.ctx.globalAlpha = 1;
        }
    }

    drawSoundButton(){
        if (this.game.isMenuScreenOn || this.game.whiteWon || this.game.blackWon || this.game.staleMate){
            let {x,y} = this.game.mousePosition
            if (x > 0 && x < this.game.squareSize && y > 0 && y < this.game.squareSize && this.game.isMenuScreenOn) {
                this.ctx.beginPath();
                this.ctx.arc(this.game.squareSize/2, this.game.squareSize/2,
                    this.game.shiftImage*3, 0, 2 * Math.PI);
                this.ctx.fillStyle = this.game.isSoundOn ? '#f83b72' : "#97a4e3";
                this.ctx.fill();
            }
            this.ctx.drawImage(this.game.isSoundOn ? canvasImages.sound_on : canvasImages.sound_off,
                this.game.shiftImage/2,this.game.shiftImage/2, this.game.shiftImage*5, this.game.shiftImage*5);
        }
    }
}
