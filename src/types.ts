export type PieceType = {
    image: HTMLImageElement,
    x: number,
    y: number,
    color: "white" | "black",
    name: string,
}

export type Moves = {
    x: number,
    y: number,
    index: number,
}

export type Positions = Omit<Moves, 'index'>;

export type ColorPiece = {
    color: "white" | "black",
    name: string
}

export type ValidMoves = {
    validMoves: (x: number, y: number, index: number, board: PieceType[]) => Moves[]
}

export type AllMovesFunction = (board: PieceType[]) => Moves[];

export type ValidMovesFunction =
    (currX: number, currY: number, index: number, board: PieceType[]) => Moves[]
