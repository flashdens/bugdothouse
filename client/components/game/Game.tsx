import TestChessboard, {PlayerSide} from "@/components/test/TestChessboard";
import TestPocket from "@/components/test/TestPocket";
import React, {useContext, useEffect, useState} from "react";
import HTML5Backend from "@/services/CustomHTML5Backend";
import {DndProvider} from "react-dnd";
import GameContext, {GameContextData, PlayerRole} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";
import assert from "assert";

interface GameProps {
    gameData: GameContextData
}

const Game: React.FC<GameProps> = ({ gameData }) => {
    const { gameContextData, updateGameContext } = useContext(GameContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        updateGameContext(gameData);
    }, []);

    if (!gameContextData) {
        return <div>Loading...</div>;
    }

    return (
        // context=window fixes two backends error?
        <DndProvider backend={HTML5Backend} context={window}>
            <div className={"flex flex-row gap-20 justify-around"}>
            {gameContextData && (
                <>
                    {Object.keys(gameContextData.boards).map((subgameId) => {
                        if (gameContextData.boards[subgameId] && user) {
                            let localPlayerIs: PlayerRole =
                                gameContextData.boards[subgameId].localPlayerIs

                            let playerSide: PlayerSide;

                            if (localPlayerIs == PlayerRole.whitePlayer) {
                                playerSide = 'WHITE';
                            } else if (localPlayerIs == PlayerRole.blackPlayer) {
                                playerSide = 'BLACK';
                            } else if (localPlayerIs == PlayerRole.spectator) {
                                playerSide = 'SPECTATOR'
                            }
                            else {
                                assert(false);
                            }

                            return (
                                <div className={"chessboard"} key={subgameId}>
                                    <TestPocket
                                        pocketOf={playerSide === "BLACK" ? "WHITE" : "BLACK"}
                                        playerSide={playerSide}
                                        subgameId={subgameId}
                                    />
                                    <TestChessboard
                                        cbId={subgameId}
                                        playerSide={playerSide}
                                    />
                                    <TestPocket
                                        pocketOf={playerSide === "BLACK" ? "BLACK" : "WHITE"}
                                        playerSide={playerSide}
                                        subgameId={subgameId}
                                    />
                                </div>
                            );
                        }
                        // Return null if condition doesn't match to avoid rendering anything
                        return null;
                    })}
                </>
            )}
            </div>
        </DndProvider>
    );
};

export default Game;
