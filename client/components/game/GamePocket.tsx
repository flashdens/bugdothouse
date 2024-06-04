import React, {useContext} from 'react';

import TestPocketPiece from './GamePocketPiece';
import defaultPieces from "@/public/pieces/pieces";
import GameContext from "@/context/GameContext";
import {PlayerSide} from "@/components/game/GameChessboard";

interface TestPocketProps {
    playerSide: PlayerSide,
    pocketOf: 'WHITE' | 'BLACK',
    subgameId: string
}


const GamePocket: React.FC<TestPocketProps> = ({playerSide, pocketOf, subgameId}) => {

    const {gameContextData} = useContext(GameContext);
    if (!gameContextData) return;

    const {whitePocket, blackPocket} = gameContextData.boards[subgameId];

    return (
        <div className={'border flex flex-row border-black my-2'}>
        {pocketOf === 'WHITE' ? (
            <>
                <TestPocketPiece svg={defaultPieces.wP} piece={"wP"} side={playerSide} pocketOf={pocketOf} count={whitePocket["P"]} />
                <TestPocketPiece svg={defaultPieces.wN} piece={"wN"} side={playerSide}  pocketOf={pocketOf} count={whitePocket["N"]}/>
                <TestPocketPiece svg={defaultPieces.wB} piece={"wB"} side={playerSide}  pocketOf={pocketOf} count={whitePocket["B"]} />
                <TestPocketPiece svg={defaultPieces.wR} piece={"wR"} side={playerSide}  pocketOf={pocketOf} count={whitePocket["R"]} />
                <TestPocketPiece svg={defaultPieces.wQ} piece={"wQ"} side={playerSide}  pocketOf={pocketOf}  count={whitePocket["Q"]}/>
            </>
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
    )};

export default GamePocket;
