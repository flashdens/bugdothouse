import React from 'react';
import { useDrop } from 'react-dnd';
import TestPocketPiece, { ItemTypes } from './TestPocketPiece'; // You'll need to define this
import defaultPieces from "@/public/pieces/pieces";

const TestPocket = () => {

    return (
        <div
            style={{
                width: '200px',
                border: '1px solid black',
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
                <TestPocketPiece svg={defaultPieces.wP} piece={"wP"} />
                <TestPocketPiece svg={defaultPieces.wN} piece={"wN"} />
                <TestPocketPiece svg={defaultPieces.wQ} piece={"wQ"} />
        </div>
    );
};

export default TestPocket;
