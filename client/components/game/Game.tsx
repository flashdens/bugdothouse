import GameChessboard, {PlayerSide} from "@/components/game/GameChessboard";
import GamePocket from "@/components/game/GamePocket";
import React, {useContext, useEffect, useState} from "react";
import HTML5Backend from "@/services/CustomHTML5Backend";
import {DndProvider} from "react-dnd";
import GameContext, {GameContextData, GameMode, PlayerRole} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";
import assert from "assert";
import PlayerInfo from "@/components/game/PlayerInfo";

/**
 * @interface GameProps
 * @brief Props komponentu Game.
 *
 * @property {GameContextData} gameData dane dotyczące gry, pobierane przed wyświetlaniem komponentu z serwera.
 */
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
    /**
     * @brief określa numer drużyny, do której należy gracz.
     *
     * @returns zwraca '1', jeżeli gracz gra białymi, '2', jeśli czarnymi, undefined, jeżeli jest obserwatorem
     */
    const determineTeamNumber = (side: string): '1' | '2' | undefined => {
        if (side === 'WHITE') {
            return '1';
        }
        else if (side === 'BLACK'){
            return '2';
        }
        else {
            return undefined;
        }
    }

    const flexClasses = game.boards[1].primaryGame
        ? "flex flex-col lg:flex-row justify-around my-16"
        : "flex flex-col-reverse lg:flex-row-reverse justify-around my-16";
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

                                <div className={"flex flex-col items-center space-y-2 py-2 md:py-5 bg-white rounded-lg shadow-2xl px-8 w-auto"} key={subgameId}>
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
        </DndProvider>
    );
};

export default Game;
