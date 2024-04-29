import React from 'react';
import { useDrag } from 'react-dnd';

export const ItemTypes = {
  CHESS_PIECE: 'chessPiece',
};

interface ChessPieceProps {
    type: string;
    position: string;
}

interface DragItem {
    type: string;
    position: string;
    pieceType: string;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ type, position }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CHESS_PIECE,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

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
            {type}
        </div>
    );
};

export default ChessPiece;
