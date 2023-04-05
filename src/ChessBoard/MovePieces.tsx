import React from "react";
import "./ChessBoard.css"

interface Props {
    pieces: {src: string, x: number, y:number, color: "white" | "black", name: string}[];
    squareSize: number;
    canvasSize: number;
    imageSize: number;
}

interface State {
    positions: { x: number; y: number }[];
}

export class MovePieces extends React.Component<Props, State> {
    canvasRef = React.createRef<HTMLCanvasElement>();
    pieceImages: HTMLImageElement[] = []
    isDragging: boolean = false
    draggingIndex: number = -1
    mousePosition = {x: 0, y: 0}
    initialPositions = this.props.pieces.map(({x, y}) => ({x,y}))
    colorAndNameArray = this.props.pieces.map(({color, name}) => ({name, color}))

    public constructor(props: Props) {
        super(props);

        for (let i = 0; i < this.props.pieces.length; i++) {
            const image = new Image();
            image.src = this.props.pieces[i].src;
            this.pieceImages.push(image)
        }
    }

    state: State = {
        positions: this.props.pieces.map(({x,y}) => ({ x, y })),
    }

    componentDidMount() {
        const canvas = this.canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        window.addEventListener("mousemove", this.handleMouseMove);
        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("mouseup", this.onMouseUp);
        this.draw_pieces(ctx);
    }

    componentWillUnmount() {
        const canvas = this.canvasRef.current!;
        canvas.removeEventListener("mousemove", this.onMouseMove);
        canvas.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("mousemove", this.handleMouseMove)
    }

    getMousePositions(event: any){
        const canvas = this.canvasRef.current!;
        const { left, top } = canvas.getBoundingClientRect();
        return {
            x: event.clientX - left,
            y: event.clientY - top,
        }
    }

    onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const mousePositions = this.getMousePositions(event)
        const index = this.getIndexAtPosition(mousePositions.x, mousePositions.y);
        if (index !== -1) {
            this.isDragging = true
            this.draggingIndex = index
            this.initialPositions[index] = { ...this.state.positions[index] };
            window.addEventListener("pointermove", this.onMouseMove);
            window.addEventListener("pointerup", this.onMouseUp);
            this.mousePosition = { x: mousePositions.x, y: mousePositions.y };
        }
    }

    onMouseUp = () => {
        this.isDragging = false
        this.draggingIndex = -1
        window.removeEventListener("pointermove", this.onMouseMove);
        window.removeEventListener("pointerup", this.onMouseUp);
    }

    handleMouseMove = (event: MouseEvent) => {
        const mousePositions = this.getMousePositions(event)
        let x = mousePositions.x
        let y = mousePositions.y
        //Can't move pieces outside of canvas
        const line = this.props.canvasSize - this.props.imageSize
        if (x >= line) x = line
        if (x <= 0) x = 0
        if (y <= 0) y = 0
        if (y >= line) y = line
        this.mousePosition = { x: x, y: y };
    }

    onMouseMove = (event: MouseEvent) => {
        const mousePositions = this.getMousePositions(event)
        let x = mousePositions.x
        let y = mousePositions.y
        const i = this.draggingIndex
        // Update position of the piece to be in the middle of the square
        for (let xPos = 0; xPos < this.props.canvasSize; xPos += this.props.squareSize){
            for (let yPos = 0; yPos < this.props.canvasSize; yPos += this.props.squareSize){
                if (this.mousePosition.x >= xPos &&
                    this.mousePosition.x <= xPos + this.props.squareSize &&
                    this.mousePosition.y >= yPos &&
                    this.mousePosition.y <= yPos + this.props.squareSize){
                        x = xPos + 12.5
                        y = yPos + 12.5
                }
            }
        }
        if (this.draggingIndex !== -1) {
            if (this.colorAndNameArray[i].color === "white" && this.colorAndNameArray[i].name === "pawn") {
                let initialPosXStart = this.state.positions[i].x - 12.5
                let initialPosXEnd = this.state.positions[i].x + 62.5
                let initialPosYStart = this.state.positions[i].y - 12.5
                let initialPosYEnd = this.state.positions[i].y + 62.5
                console.log(initialPosYStart, initialPosYEnd)
                if (!(initialPosXStart <= x && x <= initialPosXEnd) || y >= initialPosYStart+25){
                    x = this.initialPositions[i].x;
                    y = this.initialPositions[i].y;
                }
            }
        }

        //Only update the state if the mouse has been moved
        if (x !== this.mousePosition.x || y !== this.mousePosition.y) {
            const positions = [...this.state.positions];
            positions[this.draggingIndex] = { x, y };
            this.setState({ positions });
            this.mousePosition = { x, y }
        }
    }

    getIndexAtPosition = (x: number, y: number) => {
        const positions = this.state.positions;
        for (let i = 0; i < positions.length; i++) {
            const { x: imageX, y: imageY } = positions[i];
            const imageSize = this.props.imageSize;
            if (x >= imageX && x <= imageX + imageSize && y >= imageY && y <= imageY + imageSize) return i;
        }
        return -1;
    }

    draw_pieces = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, this.props.canvasSize, this.props.canvasSize);
        const squareSize = this.props.squareSize
        //Draw background
        if (ctx) {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const x = col * squareSize;
                    const y = row * squareSize;
                    ctx.fillStyle = (row + col) % 2 === 0 ? "#FFFFFF" : '#000000';
                    ctx.fillRect(x, y, squareSize, squareSize);
                }
            }
        }
        //Draw pieces
        for (let i = 0; i < this.props.pieces.length; i++) {
            const image = this.pieceImages[i];
            let { x, y } = this.state.positions[i];

            // If the piece is being dragged, draw it at the current mouse position
            if (this.isDragging && i === this.draggingIndex) {
                x = this.mousePosition.x;
                y = this.mousePosition.y;
            }
            ctx.drawImage(image, x, y, this.props.imageSize, this.props.imageSize);
        }
        requestAnimationFrame(() => this.draw_pieces(ctx));
    }

    render() {
        return (
            <canvas
                className={"chessboard"}
                ref={this.canvasRef}
                width={this.props.canvasSize}
                height={this.props.canvasSize}
                onMouseDown={this.onMouseDown}
            />
        )
    }
}