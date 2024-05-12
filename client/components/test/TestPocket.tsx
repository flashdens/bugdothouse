import React, {useContext} from 'react';
import { useDrop } from 'react-dnd';
import TestPocketPiece from './TestPocketPiece';
import defaultPieces from "@/public/pieces/pieces";
import GameContext from "@/context/GameContext";

interface TestPocketProps {
    side: 'WHITE' | 'BLACK';
}


const TestPocket: React.FC<TestPocketProps> = ({side}) => {

    const {contextData, updateGameContext} = useContext(GameContext);
    if (!contextData) return;

    const {whitePocket, blackPocket} = contextData;

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
                <TestPocketPiece svg={defaultPieces.wP} piece={"wP"} count={whitePocket["P"]} />
                <TestPocketPiece svg={defaultPieces.wN} piece={"wN"} count={whitePocket["N"]}/>
                <TestPocketPiece svg={defaultPieces.wB} piece={"wB"} count={whitePocket["B"]} />
                <TestPocketPiece svg={defaultPieces.wR} piece={"wR"} count={whitePocket["R"]} />
                <TestPocketPiece svg={defaultPieces.wQ} piece={"wQ"} count={whitePocket["Q"]}/>
            </>
        ) : (
            <>
                <TestPocketPiece svg={defaultPieces.bP} piece={"bP"} count={blackPocket["p"]} />
                <TestPocketPiece svg={defaultPieces.bN} piece={"bN"} count={blackPocket["n"]}/>
                <TestPocketPiece svg={defaultPieces.bB} piece={"bB"} count={blackPocket["b"]}/>
                <TestPocketPiece svg={defaultPieces.bR} piece={"bR"} count={blackPocket["r"]}/>
                <TestPocketPiece svg={defaultPieces.bQ} piece={"bQ"} count={blackPocket["q"]}/>
            </>
        )}
        </div>
    );
};

export default TestPocket;
