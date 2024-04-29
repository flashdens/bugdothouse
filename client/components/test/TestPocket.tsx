import React from 'react';
import { useDrop } from 'react-dnd';
import ChessPiece, { ItemTypes } from './ChessPiece'; // You'll need to define this
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
                <ChessPiece svg={defaultPieces.wP} piece={"wP"} />
                <ChessPiece svg={defaultPieces.wN} piece={"wN"} />
                <ChessPiece svg={defaultPieces.wQ} piece={"wQ"} />
        </div>
    );
};

export default TestPocket;
