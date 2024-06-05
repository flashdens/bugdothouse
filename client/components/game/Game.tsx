import GameChessboard, {PlayerSide} from "@/components/game/GameChessboard";
import GamePocket from "@/components/game/GamePocket";
import React, {useContext, useEffect} from "react";
import HTML5Backend from "@/services/CustomHTML5Backend";
import {DndProvider} from "react-dnd";
import GameContext, {GameContextData, PlayerRole} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";
import assert from "assert";
import PlayerInfo from "@/components/game/PlayerInfo";

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
            <div className={`flex flex-col lg:flex-row justify-around`}>
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

                            let board = gameContextData.boards[subgameId];

                            return (
                                /* todo - in the future i would like the second game to be expanded from the side.
                                but it's a different story...
                                */

                                <div className={"space-y-2 py-20 lg:py-2"} key={subgameId}>
                                    <GamePocket
                                        pocketOf={playerSide === "BLACK" ? "WHITE" : "BLACK"}
                                        playerSide={playerSide}
                                        subgameId={subgameId}
                                    />
                                    <PlayerInfo
                                        player={playerSide === "BLACK"
                                            ? board.whitePlayer
                                            : board.blackPlayer }
                                        playerColor = {playerSide === "BLACK" ? "WHITE" : "BLACK"}
                                        sideToMove={board.sideToMove}
                                    />
                                    <GameChessboard
                                        cbId={subgameId}
                                        playerSide={playerSide}
                                    />
                                    <PlayerInfo
                                        player={playerSide === "BLACK"
                                            ? board.blackPlayer
                                            : board.whitePlayer }
                                        playerColor = {playerSide === "BLACK" ? "BLACK" : "WHITE"}
                                        sideToMove={board.sideToMove}
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
            {gameContextData.result && 'THE GAME HAS ENDED' }
        </DndProvider>
    );
};

export default Game;
