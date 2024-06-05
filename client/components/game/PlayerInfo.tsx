import React, {useContext} from "react";
import GameContext, {GameMode, GameStatus, Player} from "@/context/GameContext";

interface PlayerInfoProps {
    player: Player,
    playerColor: 'WHITE' | 'BLACK',
    sideToMove: boolean,
    teamNumber: string
}


const PlayerInfo: React.FC<PlayerInfoProps> = ({player, playerColor, sideToMove, teamNumber}) => {

    const {game} = useContext(GameContext);
    const WHITE: boolean = true;
    const BLACK: boolean = false;

    if (!game)
        return;

    const isPlayerTurn =
        ((playerColor === 'WHITE' && sideToMove == WHITE)
        || (playerColor == 'BLACK' && sideToMove == BLACK))
        && (game?.status == GameStatus.ONGOING)
    return(
        <>
            <div className="flex justify-between items-center w-65dvh">
                <div className={`flex-1 text-center ${isPlayerTurn ? 'bg-green-500' : ''}`}>
                    {player.username} {game.gameMode === GameMode.BUGHOUSE ? ' - TEAM ' + teamNumber : ''}
                </div>
                <div className="text-right whitespace-nowrap">
                    5:00
                </div>
            </div>
        </>
    )
}

export default PlayerInfo;