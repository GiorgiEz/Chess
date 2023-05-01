export type PieceType = {
    src: string,
    x: number,
    y:number,
    color: "white" | "black",
    name: string,
    isAlive: boolean,
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

export type AlivePiece = {
    x: number,
    y: number,
    isAlive: boolean
}

export type ValidMoves = {
    validMoves: (x: number, y: number, index: number, board: Positions[], pieceColors: ColorPiece[]) => Moves[]
}

export type AllMovesFunction = (board: Positions[], color_name_arr: ColorPiece[]) => Moves[];

export type ValidMovesFunction =
    (currX: number, currY: number, index: number, board: Positions[], color_name_arr: ColorPiece[]) => Moves[]
