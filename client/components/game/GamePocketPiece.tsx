import React, { ReactNode } from 'react';
import { useDrag } from 'react-dnd';
import {PlayerSide} from "@/components/game/GameChessboard";

interface ChessPieceProps {
    piece: "wP" | "wB" | "wN" | "wR" | "wQ" | "wK" | "bP" | "bB" | "bN" | "bR" | "bQ" | "bK";
    svg: ReactNode;
    count: number;
    side: PlayerSide
    pocketOf: "WHITE" | "BLACK";
}

const GamePocketPiece: React.FC<ChessPieceProps> = ({ piece, svg, count, side, pocketOf }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'piece',
        item: () => ({ piece }),
        end: () => console.log("finished dragging"),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => {
            return count && (side === "WHITE" && piece[0] === "w") || (side === "BLACK" && piece[0] === "b");
        }
    });

    console.log(piece, count);

    return (
        <div
            style={{
                position: 'relative',
                display: 'inline-block',
            }}
        >
            <div
                ref={drag}
                className={"piece"}
                style={{
                    opacity: (isDragging || !count || side !== pocketOf) ? 0.4 : 1,
                    fontSize: 25,
                    fontWeight: 'bold',
                    cursor: (side === pocketOf && count) ? 'move' : 'not-allowed',
                }}>
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
                {count ? count : 0}
            </div>
        </div>
    );
};


export default GamePocketPiece;
