import React, {ReactNode, useEffect, useState} from 'react';
import { useDrag } from 'react-dnd';
import Piece from "react-chessboard/dist/chessboard/types/index"

export const ItemTypes = {
  CHESS_PIECE: 'chessPiece',
};

interface ChessPieceProps {
    piece: "wP" | "wB" | "wN" | "wR" | "wQ" | "wK" | "bP" | "bB" | "bN" | "bR" | "bQ" | "bK";
    svg: ReactNode
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece, svg }) => {
    const [{ isDragging }, drag, dragPreview] = useDrag({
        type: ItemTypes.CHESS_PIECE,
        item: () => {
            console.log("dragged", piece)
            return {piece}
        },
        end: () => {
            console.log("finished dragging")
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    },
    [piece]
    );

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                fontSize: 25,
                fontWeight: 'bold',
                cursor: 'move',
            }}
        >
            {svg}
        </div>
    );
};

export default ChessPiece;
