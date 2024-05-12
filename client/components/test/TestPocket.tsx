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
    console.log(contextData)

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
            <div>
                <TestPocketPiece svg={defaultPieces.wP} piece={"wP"} side={side} count={whitePocket["P"]} />
                <TestPocketPiece svg={defaultPieces.wN} piece={"wN"} side={side} count={whitePocket["N"]}/>
                <TestPocketPiece svg={defaultPieces.wB} piece={"wB"} side={side} count={whitePocket["B"]} />
                <TestPocketPiece svg={defaultPieces.wR} piece={"wR"} side={side} count={whitePocket["R"]} />
                <TestPocketPiece svg={defaultPieces.wQ} piece={"wQ"} side={side}  count={whitePocket["Q"]}/>
            </div>
        ) : (
            <div>
                <TestPocketPiece svg={defaultPieces.bP} piece={"bP"} side={side} count={blackPocket["p"]} />
                <TestPocketPiece svg={defaultPieces.bN} piece={"bN"} side={side} count={blackPocket["n"]}/>
                <TestPocketPiece svg={defaultPieces.bB} piece={"bB"} side={side} count={blackPocket["b"]}/>
                <TestPocketPiece svg={defaultPieces.bR} piece={"bR"} side={side} count={blackPocket["r"]}/>
                <TestPocketPiece svg={defaultPieces.bQ} piece={"bQ"} side={side} count={blackPocket["q"]}/>
            </div>
        )}
        </div>
    );
};

export default TestPocket;
