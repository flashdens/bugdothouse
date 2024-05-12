import React, { ReactNode } from 'react';
import { useDrag } from 'react-dnd';

interface ChessPieceProps {
    piece: "wP" | "wB" | "wN" | "wR" | "wQ" | "wK" | "bP" | "bB" | "bN" | "bR" | "bQ" | "bK";
    svg: ReactNode;
    count: number;
}

const TestPocketPiece: React.FC<ChessPieceProps> = ({ piece, svg, count }) => {
    const [{ isDragging }, drag, dragPreview] = useDrag({
        type: 'piece',
        item: () => ({ piece }),
        end: () => console.log("finished dragging"),
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            style={{
                position: 'relative',
                opacity: isDragging ? 0 : 1,
                fontSize: 25,
                fontWeight: 'bold',
                cursor: 'move',
                display: 'inline-block',
            }}
        >
            {svg}
            <div
                style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    background: 'white',
                    borderRadius: '50%',
                    padding: '2px 5px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid black',
                }}
            >
                {count}
            </div>
        </div>
    );
};

export default TestPocketPiece;
