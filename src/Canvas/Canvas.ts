import {ColorPiece, PieceType, Positions} from "../types";
import {Pawn} from "../Pieces/Pawn";
import {getCurrentPositionsForAllPawns} from "../Pieces/moves/AllMoves";
import {createImage, getIndexAtPosition} from "../utils";
import {
    pieceImages,
    squareSize,
    imageSize,
    shiftImage,
    canvasSize,
    buttonImages
} from "../exports";
import {Team} from "../ChessBoard/Team";

const canvasImages = {
    restart_image: createImage(buttonImages.restart_button),
    restart_image_hover: createImage(buttonImages.restart_button_hover),
    sound_on: createImage(buttonImages.sound_on),
    sound_off: createImage(buttonImages.sound_off),
}

export class Canvas{
    static menuScreen = true
    static soundOn = true;

    constructor(
        private ctx: CanvasRenderingContext2D,
        private mousePosition: Positions,
        private draggingIndex: number,
        private board: PieceType[],
    ) {}

    clearCanvas(){
        this.ctx.clearRect(0, 0, canvasSize, canvasSize);
    }

    drawPlayButton() {
        if (Canvas.menuScreen) {
            const { x, y } = this.mousePosition;
            const playButton = {
                x: canvasSize / 2 - 2*squareSize+4*shiftImage,
                y: canvasSize / 2 - shiftImage
            }

            this.ctx.fillStyle = "#1A233B";
            this.ctx.fillRect(playButton.x, playButton.y, 200, 100);

            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = "70px Arial";
            this.ctx.fillText("PLAY", playButton.x + shiftImage, playButton.y + squareSize);

            if (x > playButton.x && x < playButton.x + 200 && y > playButton.y && y < playButton.y + 100) {
                this.ctx.fillStyle = "rgb(128,128,128, 0.2)";
                this.ctx.fillRect(playButton.x, playButton.y, 200, 100);
            }
        }
    }

    drawHighlightingCircles(highlightedSquares: Positions[]) {
        if (!highlightedSquares) return
        for (let pos of highlightedSquares) {
            const gradient = this.ctx.createRadialGradient(pos.x + 25, pos.y + 25,
                0, pos.x + 25, pos.y + 25, squareSize / 4);
            gradient.addColorStop(0, "#e0eee7");
            gradient.addColorStop(1, "#e6efed");

            this.ctx.save();
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowOffsetX = 5;
            this.ctx.shadowOffsetY = 5;

            this.ctx.beginPath();
            this.ctx.arc(pos.x + 25, pos.y + 25, squareSize / 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    drawThreatenedSquares(threatenedSquares: Positions[]) {
        for (let pos of threatenedSquares) {
            this.ctx.fillStyle = "#cb0101";
            this.ctx.fillRect(pos.x - 10, pos.y - 10, squareSize - 5, squareSize - 5);
        }
    }

    drawBoardBackground() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * squareSize;
                const y = row * squareSize
                this.ctx.fillStyle = (row + col) % 2 === 0 ? "#1A233B" : "#808080"
                this.ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }

    drawCoordinates() {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
        const numbers = ["8", "7", "6", "5", "4", "3", "2", "1"]
        for (let i = 7; i >= 0; i--){
            this.ctx.font = 'bold 15px Helvetica';
            this.ctx.fillStyle = "#f6f6f6";
            this.ctx.fillText(numbers[i], 2, (squareSize * i) + shiftImage);
            this.ctx.fillText(letters[i], (squareSize * i)+2, canvasSize+2 - shiftImage/2)
        }
    }

    drawPieces() {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].x > 0) {
                const image = this.board[i].image;
                let {x, y} = this.board[i];
                // If the piece is being dragged, draw it at the current mouse position
                if (i === this.draggingIndex) {
                    x = this.mousePosition.x - 25;
                    y = this.mousePosition.y - 25;
                }
                this.ctx.drawImage(image, x, y, imageSize, imageSize);
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
        let {x,y} = this.mousePosition
        if (Pawn.promoteScreenOn){
            if (x >= 0 && x <= 2*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                this.shadowEffect(5, 230, 140, 140)
            } if (x >= 2*squareSize && x <= 4*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                this.shadowEffect(155, 230, 140, 140)
            } if (x >= 4*squareSize && x <= 6*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize) {
                this.shadowEffect(305, 230, 140, 140)
            } if (x >= 6*squareSize && x <= 8*squareSize && y >= 3*squareSize && y <= canvasSize-3*squareSize){
                this.shadowEffect(455, 230, 140, 140)
            }
        }
    }

    drawPromotionScreen(board: Positions[], images: string[], moveY: number, moveX: number) {
        Pawn.promoteScreenOn = true
        Pawn.promotedPawnIndex = getIndexAtPosition(moveX, moveY, board)
        Pawn.promotedPawns.add(Pawn.promotedPawnIndex)
        this.ctx.fillStyle = "#ffffff"
        this.ctx.fillRect(0, 3*squareSize, canvasSize, 2*squareSize);
        this.hoverEffectForPromotionScreen()
        for (let dx = 0, i = 0; i < images.length; i++, dx += squareSize*2) {
            const image = new Image();
            image.src = images[i];
            this.ctx.drawImage(image,dx+2*shiftImage,3*squareSize+squareSize/3,imageSize*2,imageSize*2);
        }
    }

    promotionScreen() {
        const whiteImages = [pieceImages.white_queen, pieceImages.white_rook, pieceImages.white_bishop, pieceImages.white_knight]
        for (let move of getCurrentPositionsForAllPawns(this.board).whitePositions) {
            if (move.y <= squareSize && move.y >= 0)
                this.drawPromotionScreen(this.board, whiteImages, move.y, move.x)
        }
        const blackImages = [pieceImages.black_queen, pieceImages.black_rook, pieceImages.black_bishop, pieceImages.black_knight]
        for (let move of getCurrentPositionsForAllPawns(this.board).blackPositions) {
            if (move.y <= canvasSize && move.y >= canvasSize - squareSize)
                this.drawPromotionScreen(this.board, blackImages, move.y, move.x)
        }
    }

    drawGameOverScreen(){
        if (Team.whiteWon || Team.blackWon || Team.staleMate) {
            this.ctx.save();
            let {x,y} = this.mousePosition

            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = "#646161";
            this.ctx.fillRect(0, 0, canvasSize, canvasSize);
            this.ctx.globalAlpha = 1;

            this.ctx.save();
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 3;
            this.ctx.font = 'bold 50px Helvetica';
            this.ctx.fillStyle = "#f6f6f6";
            this.ctx.textAlign = "center"

            if (Team.staleMate) {
                this.ctx.fillText("Stalemate", canvasSize/2, 250);
            }
            else {
                this.ctx.fillText("Checkmate!", canvasSize/2, 212.5)
            }
            if (Team.whiteWon) {
                this.ctx.fillText(`White Won`, canvasSize/2, 275);
            }
            else if (Team.blackWon) {
                this.ctx.fillText(`Black Won`, canvasSize/2, 275);
            }
            this.ctx.restore();

            const centerX = 3*squareSize + 2*shiftImage
            const centerY = canvasSize / 2;

            this.ctx.drawImage(canvasImages.restart_image, centerX, centerY, imageSize * 2, imageSize * 2);
            //Hover effect
            if (x >= 3*squareSize + 2*shiftImage && x <= 5*squareSize-2*shiftImage
                && y >= canvasSize/2 && y <= canvasSize/2+1.5*squareSize)
                this.ctx.drawImage(canvasImages.restart_image_hover, centerX, centerY, imageSize * 2, imageSize * 2);
            this.ctx.restore();
        }
    }

    drawMenuScreen(){
        if (Canvas.menuScreen){
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillStyle = "#484545";
            this.ctx.fillRect(0, 0, canvasSize, canvasSize);
            this.ctx.globalAlpha = 1;
        }
    }

    drawSoundButton(){
        if (Canvas.menuScreen || Canvas.menuScreen || Team.whiteWon || Team.blackWon || Team.staleMate){
            let {x,y} = this.mousePosition
            this.ctx.beginPath();
            this.ctx.arc(squareSize/2, 32.5, 30, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#9f9999';
            this.ctx.fill();

            if (x > 0 && x < 2*squareSize && y > 0 && y < squareSize && Canvas.menuScreen) {
                this.ctx.beginPath();
                this.ctx.arc(squareSize/2, 32.5,30, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#b4b6c0';
                this.ctx.fill();
            }
            this.ctx.drawImage(Canvas.soundOn ? canvasImages.sound_on : canvasImages.sound_off,shiftImage,7.5, imageSize, imageSize);
        }
    }
}
