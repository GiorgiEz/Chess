import React from "react";

interface Props {
    pieces: {src: string, x: number, y: number}[];
}

interface State {
    positions: { x: number; y: number }[];
    isDragging: boolean;
    draggingIndex: number;
    mousePosition: { x: number; y: number; };
}

export class MovePieces extends React.Component<Props, State> {
    canvasRef = React.createRef<HTMLCanvasElement>();

    state: State = {
        positions: this.props.pieces.map(({x,y}) => ({ x, y })),
        isDragging: false,
        draggingIndex: -1,
        mousePosition: {x: 0, y: 0},
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
        };
    }

    onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const mousePositions = this.getMousePositions(event)
        const index = this.getIndexAtPosition(mousePositions.x, mousePositions.y);
        if (index !== -1) {
            this.setState({ isDragging: true, draggingIndex: index });
            window.addEventListener("pointermove", this.onMouseMove);
            window.addEventListener("pointerup", this.onMouseUp);
            this.setState({ mousePosition: { x: mousePositions.x, y: mousePositions.y } });
        }
    }

    onMouseUp = () => {
        this.setState({ isDragging: false, draggingIndex: -1 });
        window.removeEventListener("pointermove", this.onMouseMove);
        window.removeEventListener("pointerup", this.onMouseUp);
    }

    handleMouseMove = (event: MouseEvent) => {
        const mousePositions = this.getMousePositions(event)
        let x = mousePositions.x
        let y = mousePositions.y
        //Can't move pieces outside of canvas
        if (x >= 550) x = 550
        if (x <= 0) x = 0
        if (y <= 0) y = 0
        if (y >= 550) y = 550
        this.setState({ mousePosition: { x: x, y: y } });
    }

    onMouseMove = (event: MouseEvent) => {
        const mousePositions = this.getMousePositions(event)
        let x = mousePositions.x
        let y = mousePositions.y
        // Update position of the piece to be in the middle of the square
        for (let xPosition = 0; xPosition < 600; xPosition+=75){
            for (let yPosition = 0; yPosition < 600; yPosition+=75){
                if ((this.state.mousePosition.x >= xPosition && this.state.mousePosition.x <= xPosition + 75) &&
                    (this.state.mousePosition.y >= yPosition && this.state.mousePosition.y <= yPosition + 75)){
                        x = xPosition + 12.5
                        y = yPosition + 12.5
                }
            }
        }
        // Only update the state if the mouse has been moved
        if (x !== this.state.mousePosition.x || y !== this.state.mousePosition.y) {
            const positions = [...this.state.positions];
            positions[this.state.draggingIndex] = { x, y };
            this.setState({ positions, mousePosition: { x, y } });
        }
    }

    getIndexAtPosition = (x: number, y: number) => {
        const positions = this.state.positions;
        for (let i = 0; i < positions.length; i++) {
            const { x: imageX, y: imageY } = positions[i];
            const imageWidth = 50;
            const imageHeight = 50;
            if (x >= imageX && x <= imageX + imageWidth && y >= imageY && y <= imageY + imageHeight) return i;
        }
        return -1;
    }

    draw_pieces = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, 600, 600);

        for (let i = 0; i < this.props.pieces.length; i++) {
            const image = new Image();
            image.src = this.props.pieces[i].src;
            let { x, y } = this.state.positions[i];

            // If the piece is being dragged, draw it at the current mouse position
            if (this.state.isDragging && i === this.state.draggingIndex) {
                x = this.state.mousePosition.x;
                y = this.state.mousePosition.y;
            }
            ctx.drawImage(image, x, y, 50, 50);
        }
        requestAnimationFrame(() => this.draw_pieces(ctx));
    }

    render() {
        return (
            <canvas ref={this.canvasRef} width={600} height={600} onMouseDown={this.onMouseDown}/>
        )
    }
}