import React, { ReactNode } from 'react';
import { useDrag } from 'react-dnd';
import {PlayerSide} from "@/components/game/GameChessboard";
import {Piece} from "react-chessboard/dist/chessboard/types";

/**
 * @interface GamePocketPieceProps
 * @brief Props komponentu GamePocketPiece.
 *
 * @property {Piece} piece typ bierki znajdującej się w kieszeni.
 * @property {ReactNode} svg obraz bierki w formacie svg.
 * @property {number} count ilość bierek w kieszeni.
 * @property {PlayerSide} side strona w grze, którą zajmuje gracz.
 * @property {'WHITE' | 'BLACK'} pocketOf strona, do której należy kieszeń.
 */
interface GamePocketPieceProps {
    piece: Piece,
    svg: ReactNode,
    count: number,
    side: PlayerSide,
    pocketOf: 'WHITE' | 'BLACK';
}

const GamePocketPiece: React.FC<GamePocketPieceProps> = ({ piece, svg, count, side, pocketOf }) => {
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

    return (
        <div className={"relative inline-block"}
        >
            <div
                ref={drag}
                style={{
                    opacity: (isDragging || !count) ? 0.4 : 1,
                    fontSize: 25,
                    fontWeight: 'bold',
                    cursor: (side === pocketOf && count) ? 'move' : 'not-allowed',
                }}>
                    <svg
          viewBox={"1 1 43 43"}
          width={`7.5dvh`}
          height={`7.5dvh`}
        >
          <g>{svg}</g>
        </svg>
            </div>
            <div
                className={"piece-count"}
                style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    background: 'white',
                    borderRadius: '70%',
                    padding: '2px 5px',
                    fontSize: '1rem',
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
