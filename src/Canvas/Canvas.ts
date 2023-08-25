import {AlivePiece, ColorPiece, Positions} from "../types";
import {Pawn} from "../Pieces/Pawn";
import {getCurrentPositionsForAllPawns} from "../Pieces/moves/AllMoves";
import {createImage, getIndexAtPosition} from "./utils";
import {
    pieceImages,
    squareSize,
    imageSize,
    shiftImage,
    boardSize,
    canvasWidth,
    canvasHeight,
    buttonImages
} from "../exports";
import {King} from "../Pieces/King";
import {Score} from "../ChessBoard/Score";
import {Team} from "../ChessBoard/Team";

const canvasImages = {
    restart_image: createImage(buttonImages.restart_button),
    restart_image_hover: createImage(buttonImages.restart_button_hover),
    sound_on: createImage(buttonImages.sound_on),
    sound_off: createImage(buttonImages.sound_off),
}

export class Canvas{
    static menuScreen = false
    static soundOn = true;

    constructor(
        private ctx: CanvasRenderingContext2D,
        private mousePosition: Positions,
        private draggingIndex: number,
        private board: AlivePiece[],
        private pieceImages: HTMLImageElement[],
        private whiteKingName: string,
        private blackKingName: string,
        private pieceColors: ColorPiece[]
    ) {}

    clearCanvas(){
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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

    drawRedBackground(redSquares: Positions[]) {
        for (let pos of redSquares) {
            this.ctx.fillStyle = "#cb0101";
            this.ctx.fillRect(pos.x - 10, pos.y - 10, squareSize - 5, squareSize - 5);
        }
    }

    drawBoardBackground() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * squareSize + squareSize;
                const y = row * squareSize
                this.ctx.fillStyle = (row + col) % 2 === 0 ? "#1A233B" : "#808080"
                this.ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }

    drawCoordinates() {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
        const numbers = [8, 7, 6, 5, 4, 3, 2, 1]
        for (let i = 7; i >= 0; i--){
            this.ctx.font = 'bold 15px Helvetica';
            this.ctx.fillStyle = "#f6f6f6";
            this.ctx.fillText(numbers[i].toString(), shiftImage/3+squareSize, (squareSize * i) + shiftImage);
            this.ctx.fillText(letters[i], (squareSize * i) + 2*squareSize - shiftImage/2, boardSize - shiftImage/2)
        }
    }

    drawPieces()  {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].isAlive) {
                const image = this.pieceImages[i];
                let {x, y} = this.board[i];
                // If the piece is being dragged, draw it at the current mouse position
                if (i === this.draggingIndex) {
                    x = this.mousePosition.x;
                    y = this.mousePosition.y;
                }
                this.ctx.drawImage(image, x, y, imageSize, imageSize);
            }
        }
    }

    displayScoreAndNames(){
        if (!Canvas.menuScreen) {
            // Set the font properties for the text
            this.ctx.font = "bold 50px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillStyle = "white";
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 2;

            const scoreText = Score.whiteScore.toString().padStart(2, "0") + " - " + Score.blackScore.toString().padStart(2, "0");
            const x = 375;
            const y = 650;
            this.ctx.strokeText(scoreText, x, y);
            this.ctx.fillText(scoreText, x, y);

            this.ctx.drawImage(this.pieceImages[King.white_king.index], 225, 610, imageSize+shiftImage, imageSize+shiftImage);
            this.ctx.drawImage(this.pieceImages[King.black_king.index], 460, 610, imageSize+shiftImage, imageSize+shiftImage);

            this.ctx.font = 'bold 15px Future';
            this.ctx.fillStyle = "#100f0f";
            if (this.whiteKingName.length > 10) {
                this.ctx.fillText(this.whiteKingName.toUpperCase(), 125, 660);
            }
            else {
                this.ctx.font = 'bold 20px Future';
                this.ctx.fillText(this.whiteKingName.toUpperCase(), 150, 660);
            }

            if (this.blackKingName.length > 10) {
                this.ctx.font = 'bold 15px Future';
                this.ctx.fillText(this.blackKingName.toUpperCase(), 620, 660);
            }
            else {
                this.ctx.font = 'bold 20px Future';
                this.ctx.fillText(this.blackKingName.toUpperCase(), 595, 660);
            }
        }
    }

    drawKilledPieces(){
        for (let i = 0; i < Team.blackKilledPieces.length; i++){
            this.ctx.drawImage(Team.blackKilledPieces[i], 680, 40.5 * i, 30, 30)
        }
        for (let i = 0; i < Team.whiteKilledPieces.length; i++){
            this.ctx.drawImage(Team.whiteKilledPieces[i], 30, 40.5 * i, 30, 30)
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
            if (x >= squareSize && x <= 3*squareSize && y >= 3*squareSize && y <= boardSize-3*squareSize) {
                this.shadowEffect(80, 230, 140, 140)
            } if (x >= 3*squareSize && x <= canvasWidth/2 && y >= 3*squareSize && y <= boardSize-3*squareSize) {
                this.shadowEffect(230, 230, 140, 140)
            } if (x >= canvasWidth/2 && x <= canvasWidth/2+squareSize*2 && y >= 3*squareSize && y <= boardSize-3*squareSize) {
                this.shadowEffect(380, 230, 140, 140)
            } if (x >= canvasWidth/2+squareSize*2 && x <= canvasWidth-squareSize && y >= 3*squareSize && y <= boardSize-3*squareSize){
                this.shadowEffect(530, 230, 140, 140)
            }
        }
    }

    drawPromotionScreen(board: Positions[], images: string[], moveY: number, moveX: number) {
        Pawn.promoteScreenOn = true
        Pawn.promotedPawnIndex = getIndexAtPosition(moveX, moveY, board)
        Pawn.promotedPawns.add(Pawn.promotedPawnIndex)
        this.ctx.fillStyle = "#dcc27a"
        this.ctx.fillRect(squareSize, 3*squareSize, boardSize, 2*squareSize);
        this.hoverEffectForPromotionScreen()
        for (let dx = squareSize, i = 0; i < images.length; i++, dx += squareSize*2) {
            const image = new Image();
            image.src = images[i];
            this.ctx.drawImage(image,dx+2*shiftImage,3*squareSize+squareSize/3,imageSize*2,imageSize*2);
        }
    }

    promotionScreen() {
        const whiteImages = [pieceImages.white_queen, pieceImages.white_rook, pieceImages.white_bishop, pieceImages.white_knight]
        for (let move of getCurrentPositionsForAllPawns(this.board, this.pieceColors).whitePositions) {
            if (move.y <= squareSize && move.y >= 0)
                this.drawPromotionScreen(this.board, whiteImages, move.y, move.x)
        }
        const blackImages = [pieceImages.black_queen, pieceImages.black_rook, pieceImages.black_bishop, pieceImages.black_knight]
        for (let move of getCurrentPositionsForAllPawns(this.board, this.pieceColors).blackPositions) {
            if (move.y <= boardSize && move.y >= boardSize - squareSize)
                this.drawPromotionScreen(this.board, blackImages, move.y, move.x)
        }
    }

    drawGameOverScreen(){
        if (Team.whiteWon || Team.blackWon || Team.staleMate) {
            this.ctx.save();
            let {x,y} = this.mousePosition

            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = "#646161";
            this.ctx.fillRect(squareSize, 0, boardSize, boardSize);
            this.ctx.globalAlpha = 1;

            this.ctx.save();
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 3;
            this.ctx.font = 'bold 50px Helvetica';
            this.ctx.fillStyle = "#f6f6f6";
            this.ctx.textAlign = "center"

            if (Team.staleMate) this.ctx.fillText("Stalemate", 375, 250);
            else this.ctx.fillText("Checkmate!", 375, 212.5)
            if (Team.whiteWon) this.ctx.fillText(`'${this.whiteKingName}' Won`, 375, 275);
            else if (Team.blackWon) this.ctx.fillText(`'${this.blackKingName}' Won`, 375, 275);
            this.ctx.restore();

            const centerX = 4*squareSize + 2*shiftImage
            const centerY = boardSize / 2;

            this.ctx.drawImage(canvasImages.restart_image, centerX, centerY, imageSize * 2, imageSize * 2);
            //Hover effect
            if (x >= 4*squareSize + 2*shiftImage && x <= 6*squareSize-2*shiftImage
                && y >= boardSize/2 && y <= boardSize/2+1.5*squareSize)
                this.ctx.drawImage(canvasImages.restart_image_hover, centerX, centerY, imageSize * 2, imageSize * 2);
            this.ctx.restore();
        }
    }

    drawMenuScreen(){
        if (Canvas.menuScreen){
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillStyle = "#484545";
            this.ctx.fillRect(squareSize, 0, boardSize, boardSize);
            this.ctx.globalAlpha = 1;
        }
    }

    drawSoundButton(){
        if (Canvas.menuScreen || Canvas.menuScreen || Team.whiteWon || Team.blackWon || Team.staleMate){
            let {x,y} = this.mousePosition
            this.ctx.beginPath();
            this.ctx.arc(107.5, 32.5, 30, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#9f9999';
            this.ctx.fill();

            if (x > squareSize && x < 2*squareSize && y > 0 && y < squareSize && Canvas.menuScreen) {
                this.ctx.beginPath();
                this.ctx.arc(107.5, 32.5,30, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#b4b6c0';
                this.ctx.fill();
            }
            this.ctx.drawImage(Canvas.soundOn ? canvasImages.sound_on : canvasImages.sound_off,82.5,7.5, imageSize, imageSize);
        }
    }
}
