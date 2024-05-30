import React, {useContext} from 'react';

import TestPocketPiece from './TestPocketPiece';
import defaultPieces from "@/public/pieces/pieces";
import GameContext from "@/context/GameContext";
import {PlayerSide} from "@/components/test/TestChessboard";

interface TestPocketProps {
    playerSide: PlayerSide,
    pocketOf: 'WHITE' | 'BLACK',
    subgameId: string
}


const TestPocket: React.FC<TestPocketProps> = ({playerSide, pocketOf, subgameId}) => {

    const {gameContextData} = useContext(GameContext);
    if (!gameContextData) return;

    console.log(gameContextData);
    console.log(subgameId)
    const {whitePocket, blackPocket} = gameContextData.boards[subgameId];

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
                <TestPocketPiece svg={defaultPieces.wP} piece={"wP"} side={playerSide} pocketOf={pocketOf} count={whitePocket["P"]} />
                <TestPocketPiece svg={defaultPieces.wN} piece={"wN"} side={playerSide}  pocketOf={pocketOf} count={whitePocket["N"]}/>
                <TestPocketPiece svg={defaultPieces.wB} piece={"wB"} side={playerSide}  pocketOf={pocketOf} count={whitePocket["B"]} />
                <TestPocketPiece svg={defaultPieces.wR} piece={"wR"} side={playerSide}  pocketOf={pocketOf} count={whitePocket["R"]} />
                <TestPocketPiece svg={defaultPieces.wQ} piece={"wQ"} side={playerSide}  pocketOf={pocketOf}  count={whitePocket["Q"]}/>
            </div>
        ) : (
            <div>
                <TestPocketPiece svg={defaultPieces.bP} piece={"bP"} side={playerSide}  pocketOf={pocketOf} count={blackPocket["p"]} />
                <TestPocketPiece svg={defaultPieces.bN} piece={"bN"} side={playerSide}  pocketOf={pocketOf} count={blackPocket["n"]}/>
                <TestPocketPiece svg={defaultPieces.bB} piece={"bB"} side={playerSide}  pocketOf={pocketOf} count={blackPocket["b"]}/>
                <TestPocketPiece svg={defaultPieces.bR} piece={"bR"} side={playerSide}  pocketOf={pocketOf} count={blackPocket["r"]}/>
                <TestPocketPiece svg={defaultPieces.bQ} piece={"bQ"} side={playerSide}  pocketOf={pocketOf} count={blackPocket["q"]}/>
            </div>
        )}
        </div>
    );
};

export default TestPocket;
