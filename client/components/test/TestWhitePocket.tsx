import React from 'react';
import { useDrop } from 'react-dnd';
import ChessPiece, { ItemTypes } from './ChessPiece'; // You'll need to define this
import defaultPieces from "@/public/pieces/pieces";

const ChessBoard = () => {
    const [, drop] = useDrop({
        accept: ItemTypes.CHESS_PIECE,
        drop: (item, monitor) => {
            // Handle drop logic here if needed
        },
    });

    return (
        <div
            ref={drop}
            style={{
                width: '200px',
                height: '200px',
                border: '1px solid black',
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            {[1, 2, 3].map((index) => (
                <ChessPiece key={index} type={defaultPieces.wP} position={`pawn${index}`} />
            ))}
        </div>
    );
};

export default ChessBoard;
