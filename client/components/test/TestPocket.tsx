import React, {useContext} from 'react';
import { useDrop } from 'react-dnd';
import TestPocketPiece from './TestPocketPiece';
import defaultPieces from "@/public/pieces/pieces";
import GameContext from "@/context/GameContext";

interface TestPocketProps {
    side: 'WHITE' | 'BLACK';
    pocketOf: 'WHITE' | 'BLACK';
}


const TestPocket: React.FC<TestPocketProps> = ({side, pocketOf}) => {

    const {gameContextData, updateGameContext} = useContext(GameContext);
    if (!gameContextData) return;
    console.log(gameContextData)

    const {whitePocket, blackPocket} = gameContextData;

    return (
        <div
        style={{
            width: '260px',
            border: '1px solid black',
            display: 'flex',
            justifyContent: 'space-between',
        }}
    >
        {pocketOf === 'WHITE' ? (
            <div>
                <TestPocketPiece svg={defaultPieces.wP} piece={"wP"} side={side} pocketOf={pocketOf} count={whitePocket["P"]} />
                <TestPocketPiece svg={defaultPieces.wN} piece={"wN"} side={side}  pocketOf={pocketOf} count={whitePocket["N"]}/>
                <TestPocketPiece svg={defaultPieces.wB} piece={"wB"} side={side}  pocketOf={pocketOf} count={whitePocket["B"]} />
                <TestPocketPiece svg={defaultPieces.wR} piece={"wR"} side={side}  pocketOf={pocketOf} count={whitePocket["R"]} />
                <TestPocketPiece svg={defaultPieces.wQ} piece={"wQ"} side={side}  pocketOf={pocketOf}  count={whitePocket["Q"]}/>
            </div>
        ) : (
            <div>
                <TestPocketPiece svg={defaultPieces.bP} piece={"bP"} side={side}  pocketOf={pocketOf} count={blackPocket["p"]} />
                <TestPocketPiece svg={defaultPieces.bN} piece={"bN"} side={side}  pocketOf={pocketOf} count={blackPocket["n"]}/>
                <TestPocketPiece svg={defaultPieces.bB} piece={"bB"} side={side}  pocketOf={pocketOf} count={blackPocket["b"]}/>
                <TestPocketPiece svg={defaultPieces.bR} piece={"bR"} side={side}  pocketOf={pocketOf} count={blackPocket["r"]}/>
                <TestPocketPiece svg={defaultPieces.bQ} piece={"bQ"} side={side}  pocketOf={pocketOf} count={blackPocket["q"]}/>
            </div>
        )}
        </div>
    );
};

export default TestPocket;
