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
        ? "flex flex-col lg:flex-row justify-center items-center lg:justify-around"
        : "flex flex-col-reverse lg:flex-row-reverse items-center justify-center lg:justify-around";

        // TODO above is broken for spectators only

        return (
    <div className="w-full">
      <DndProvider backend={HTML5Backend} context={window}>
        {game && (
          <div className={flexClasses}>
            {Object.keys(game.boards).map((subgameId) => {
              if (user) {
                const board = game.boards[subgameId];
                const localPlayerIs = board.localPlayerIs;
                let playerSide;

                if (localPlayerIs === PlayerRole.whitePlayer) {
                  playerSide = 'WHITE';
                } else if (localPlayerIs === PlayerRole.blackPlayer) {
                  playerSide = 'BLACK';
                } else if (localPlayerIs === PlayerRole.spectator) {
                  playerSide = 'SPECTATOR';
                } else {
                  assert(false);
                }

                return (
                  <div
                    className="flex flex-col items-center justify-center space-y-2 p-1 lg:px-8 m-2 lg:m-0 md:py-5 bg-white rounded-lg shadow-2xl w-max"
                    key={subgameId}
                  >
                    {game.gameMode !== GameMode.CLASSICAL && (
                      <GamePocket
                        pocketOf={playerSide === 'SPECTATOR' || playerSide === 'BLACK' ? 'WHITE' : 'BLACK'}
                        playerSide={playerSide}
                        subgameId={subgameId}
                      />
                    )}
                    <PlayerInfo
                      player={playerSide === 'BLACK' ? board.whitePlayer : board.blackPlayer}
                      playerColor={playerSide === 'BLACK' ? 'WHITE' : 'BLACK'}
                      sideToMove={board.sideToMove}
                      teamNumber={determineTeamNumber(playerSide === 'BLACK' ? 'WHITE' : 'BLACK')}
                    />
                    <GameChessboard cbId={subgameId} playerSide={playerSide} />
                    <PlayerInfo
                      player={playerSide === 'BLACK' ? board.blackPlayer : board.whitePlayer}
                      playerColor={playerSide === 'BLACK' ? 'BLACK' : 'WHITE'}
                      sideToMove={board.sideToMove}
                      teamNumber={determineTeamNumber(playerSide === 'BLACK' ? 'BLACK' : 'WHITE')}
                    />
                    {game.gameMode !== GameMode.CLASSICAL && (
                      <GamePocket
                        pocketOf={playerSide === 'SPECTATOR' || playerSide === 'BLACK' ? 'BLACK' : 'WHITE'}
                        playerSide={playerSide}
                        subgameId={subgameId}
                      />
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </DndProvider>
    </div>
  );
};

export default Game;
