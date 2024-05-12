import React, { ReactNode } from 'react';
import { useDrag } from 'react-dnd';

interface ChessPieceProps {
    piece: "wP" | "wB" | "wN" | "wR" | "wQ" | "wK" | "bP" | "bB" | "bN" | "bR" | "bQ" | "bK";
    svg: ReactNode;
    count: number;
    side: "WHITE" | "BLACK";
}

const TestPocketPiece: React.FC<ChessPieceProps> = ({ piece, svg, count, side }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'piece',
        item: () => ({ piece }),
        end: () => console.log("finished dragging"),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => {
            return (side === "WHITE" && piece[0] === "w") || (side === "BLACK" && piece[0] === "b");
        }
    });

    return (
        <div
            style={{
                position: 'relative',
                display: 'inline-block',
            }}
        >
            {count > 0 ? (
                <>
                    <div
                        ref={drag}
                        className={"piece"}
                        style={{
                            opacity: isDragging ? 0 : 1,
                            fontSize: 25,
                            fontWeight: 'bold',
                            cursor: 'move',
                        }}
                    >
                        {svg}
                    </div>
                    <div
                        className={"piece-count"}
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
                </>
            ) : (
                <div
                    style={{
                        opacity: 0.4,
                        fontSize: 25,
                        fontWeight: 'bold',
                        cursor: 'not-allowed',
                    }}
                >
                    {svg}
                </div>
            )}
        </div>
    );
};


export default TestPocketPiece;
