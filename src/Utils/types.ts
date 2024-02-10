export type PieceType = {
    image: HTMLImageElement,
    x: number,
    y: number,
    color: "white" | "black",
    name: string,
    index: number
}

export type Positions = {
    x: number,
    y: number
}

export type ValidMovesFunction = (piece: PieceType, chessboard: PieceType[]) => Positions[]
