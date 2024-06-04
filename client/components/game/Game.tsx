import GameChessboard, {PlayerSide} from "@/components/game/GameChessboard";
import GamePocket from "@/components/game/GamePocket";
import React, {useContext, useEffect} from "react";
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

    const flexOrder =
        !gameContextData.boards[1].primaryGame // first board is NOT where we are playing?
            ? 'flex-row-reverse' // simply switch the boards' places
            : 'flex-row'
        // TODO above is broken for spectators only

        return (
        // context=window fixes two backends error?
        <DndProvider backend={HTML5Backend} context={window}>
            <div className={`flex flex-col md:flex-row gap-20 justify-around`}>
            {gameContextData && (
                <>
                    {Object.keys(gameContextData.boards).map((subgameId) => {
                        if (user) {
                            let localPlayerIs: PlayerRole =
                                gameContextData.boards[subgameId].localPlayerIs
                            let playerSide: PlayerSide;
                            console.log(gameContextData);
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
                                <div className={"game"} key={subgameId}>
                                    <GamePocket
                                        pocketOf={playerSide === "BLACK" ? "WHITE" : "BLACK"}
                                        playerSide={playerSide}
                                        subgameId={subgameId}
                                    />
                                    <GameChessboard
                                        cbId={subgameId}
                                        playerSide={playerSide}
                                    />
                                    <GamePocket
                                        pocketOf={playerSide === "BLACK" ? "BLACK" : "WHITE"}
                                        playerSide={playerSide}
                                        subgameId={subgameId}
                                    />
                                </div>
                            );
                        }
                    })}
                </>
            )}
            </div>
        </DndProvider>
    );
};

export default Game;
