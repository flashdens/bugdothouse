import GameChessboard, {PlayerSide} from "@/components/game/GameChessboard";
import GamePocket from "@/components/game/GamePocket";
import React, {useContext, useEffect} from "react";
import HTML5Backend from "@/services/CustomHTML5Backend";
import {DndProvider} from "react-dnd";
import GameContext, {GameContextData, GameMode, PlayerRole} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";
import assert from "assert";
import PlayerInfo from "@/components/game/PlayerInfo";

interface GameProps {
    gameData: GameContextData
}

const Game: React.FC<GameProps> = ({ gameData }) => {
    const { game, updateGameContext } = useContext(GameContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        updateGameContext(gameData);
    }, []);

    if (!game) {
        return(<div>Loading...</div>);
    }

    const determineTeamNumber = (side: string) => {
        if (side === 'WHITE') {
            return '1';
        }
        else if (side === 'BLACK'){
            return '2';
        }
    }


    const flexClasses = game.boards[1].primaryGame
        ? "flex flex-col lg:flex-row justify-around"
        : "flex flex-col-reverse lg:flex-row-reverse justify-around";
        // TODO above is broken for spectators only

        return (
        // context=window fixes two backends error?
        <DndProvider backend={HTML5Backend} context={window}>
            {game && (
            <div className={flexClasses}>
                    {Object.keys(game.boards).map((subgameId) => {
                        if (user) {
                            let localPlayerIs: PlayerRole =
                                game.boards[subgameId].localPlayerIs
                            let playerSide: PlayerSide;
                            console.log(game);
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

                            let board = game.boards[subgameId];

                            return (
                                /* todo - in the future i would like the second game to be expanded from the side.
                                but it's a different story...
                                */

                                <div className={"space-y-2 py-20 lg:py-2"} key={subgameId}>
                                    {subgameId}
                                    { game.gameMode !== GameMode.CLASSICAL &&
                                    <GamePocket
                                        pocketOf={playerSide === ("SPECTATOR" || "BLACK") ? "WHITE" : "BLACK"}
                                        playerSide={playerSide}
                                        subgameId={subgameId}
                                    />
                                    }
                                    <PlayerInfo
                                        player={playerSide === "BLACK"
                                            ? board.whitePlayer
                                            : board.blackPlayer }
                                        playerColor = {playerSide === "BLACK" ? "WHITE" : "BLACK"}
                                        sideToMove={board.sideToMove}
                                        teamNumber={determineTeamNumber(
                                            subgameId,
                                            playerSide == "BLACK"
                                                ? "WHITE"
                                                : "BLACK"
                                        )}
                                    />
                                    <GameChessboard
                                        cbId={subgameId}
                                        playerSide={playerSide}
                                    />
                                    <PlayerInfo
                                        player={playerSide === "BLACK"
                                            ? board.blackPlayer
                                            : board.whitePlayer}
                                        playerColor = {playerSide === "BLACK" ? "BLACK" : "WHITE"}
                                        sideToMove={board.sideToMove}
                                        teamNumber={determineTeamNumber(
                                            subgameId,
                                            playerSide == "BLACK"
                                                ? "BLACK"
                                                : "WHITE"
                                        )}
                                    />

                                    { game.gameMode !== GameMode.CLASSICAL &&
                                    <GamePocket
                                        pocketOf={playerSide === ("SPECTATOR" || "BLACK") ? "BLACK" : "WHITE"}
                                        playerSide={playerSide}
                                        subgameId={subgameId}
                                    />
                                    }
                                </div>
                            );
                        }
                    })}
            </div>
            )}
            {game.result && <h2 className={'text-center'}>THE GAME HAS ENDED</h2> }
        </DndProvider>
    );
};

export default Game;
