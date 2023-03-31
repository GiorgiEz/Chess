import React from "react";

interface Props {
    images: {src: string, x: number, y: number}[];
}

interface State {
    positions: { x: number; y: number }[];
    isDragging: boolean;
    draggingIndex: number;
    mousePosition: { x: number; y: number; };
}

export class MoveImages extends React.Component<Props, State> {
    canvasRef = React.createRef<HTMLCanvasElement>();

    state: State = {
        positions: this.props.images.map(({x,y}) => ({ x, y })),
        isDragging: false,
        draggingIndex: -1,
        mousePosition: {x: 0, y: 0}
    }

    componentDidMount() {
        const canvas = this.canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        document.addEventListener("mousemove", this.handleMouseMove);
        this.draw_pieces(ctx);
    }

    componentWillUnmount() {
        const canvas = this.canvasRef.current!;
        canvas.removeEventListener("mousemove", this.onMouseMove);
        canvas.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("mousemove", this.handleMouseMove)
    }

    onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = this.canvasRef.current!;
        const { left, top } = canvas.getBoundingClientRect();
        const x = event.clientX - left;
        const y = event.clientY - top;
        const index = this.getIndexAtPosition(x, y);
        if (index !== -1) {
            this.setState({ isDragging: true, draggingIndex: index });
            canvas.addEventListener("mousemove", this.onMouseMove);
            canvas.addEventListener("mouseup", this.onMouseUp);
            this.setState({ mousePosition: { x: x, y: y } });
        }
    }

    onMouseUp = () => {
        const canvas = this.canvasRef.current!;
        this.setState({ isDragging: false, draggingIndex: -1 });
        canvas.removeEventListener("mousemove", this.onMouseMove);
        canvas.removeEventListener("mouseup", this.onMouseUp);
    }

    handleMouseMove = (event: MouseEvent) => {
        const canvas = this.canvasRef.current!;
        const { left, top } = canvas.getBoundingClientRect();
        let x = event.clientX - left;
        let y = event.clientY - top;

        //Can't move pieces outside of canvas
        if (x >= 460) x = 460
        if (x <= 0) x = 0
        if (y <= 0) y = 0
        if (y >= 460) y = 460
        this.setState({ mousePosition: { x, y } });
    }

    onMouseMove = (event: MouseEvent) => {
        if (!this.state.isDragging) return;
        const canvas = this.canvasRef.current!;
        const { left, top } = canvas.getBoundingClientRect();
        const x = event.clientX - left;
        const y = event.clientY - top;
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
            const imageWidth = 40;
            const imageHeight = 40;
            if (x >= imageX && x <= imageX + imageWidth && y >= imageY && y <= imageY + imageHeight) return i;
        }
        return -1;
    }

    draw_pieces = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, 500, 500);

        for (let i = 0; i < this.props.images.length; i++) {
            const image = new Image();
            image.src = this.props.images[i].src;
            let { x, y } = this.state.positions[i];

            // If the piece is being dragged, draw it at the current mouse position
            if (this.state.isDragging && i === this.state.draggingIndex) {
                x = this.state.mousePosition.x;
                y = this.state.mousePosition.y;
            }
            ctx.drawImage(image, x, y, 40, 40);
        }
        requestAnimationFrame(() => this.draw_pieces(ctx));
    }

    render() {
        return (
            <canvas ref={this.canvasRef} width={500} height={500} onMouseDown={this.onMouseDown}/>
        )
    }
}