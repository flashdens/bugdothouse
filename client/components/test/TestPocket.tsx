import React from 'react';
import { useDrop } from 'react-dnd';
import TestPocketPiece from './TestPocketPiece';
import defaultPieces from "@/public/pieces/pieces";

interface TestPocketProps {
    side: 'WHITE' | 'BLACK';
}

const TestPocket: React.FC<TestPocketProps> = ({side}) => {
    return (
        <div
        style={{
            width: '260px',
            border: '1px solid black',
            display: 'flex',
            justifyContent: 'space-between',
        }}
    >
        {side === 'WHITE' ? (
            <>
                <TestPocketPiece svg={defaultPieces.wP} piece={"wP"} />
                <TestPocketPiece svg={defaultPieces.wN} piece={"wN"} />
                <TestPocketPiece svg={defaultPieces.wB} piece={"wB"} />
                <TestPocketPiece svg={defaultPieces.wR} piece={"wR"} />
                <TestPocketPiece svg={defaultPieces.wQ} piece={"wQ"} />
            </>
        ) : (
            <>
                <TestPocketPiece svg={defaultPieces.bP} piece={"bP"} />
                <TestPocketPiece svg={defaultPieces.bN} piece={"bN"} />
                <TestPocketPiece svg={defaultPieces.bB} piece={"bB"} />
                <TestPocketPiece svg={defaultPieces.bR} piece={"bR"} />
                <TestPocketPiece svg={defaultPieces.bQ} piece={"bQ"} />
            </>
        )}
        </div>
    );
};

export default TestPocket;
