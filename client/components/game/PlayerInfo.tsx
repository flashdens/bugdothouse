import React, {useContext} from "react";
import GameContext, {GameMode, GameStatus, Player} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";

interface PlayerInfoProps {
    player: Player,
    playerColor: 'WHITE' | 'BLACK',
    sideToMove: boolean,
    teamNumber: string
}


const PlayerInfo: React.FC<PlayerInfoProps> = ({player, playerColor, sideToMove, teamNumber}) => {

    const {game} = useContext(GameContext);
    const {user} = useContext(AuthContext);
    const WHITE: boolean = true;
    const BLACK: boolean = false;

    if (!game)
        return;

    const isPlayerTurn =
        ((playerColor === 'WHITE' && sideToMove == WHITE)
        || (playerColor == 'BLACK' && sideToMove == BLACK))
        && (game?.status == GameStatus.ONGOING)

    const isLocalPlayer =  (user?.user_id === player.id)

    return(
        <>
            <div className="flex justify-between items-center w-65dvh">
                <div className={`flex-1 text-center 
                ${isPlayerTurn ? 'bg-green-500' : ''}
                ${isLocalPlayer ? 'font-bold' : ''}`}>
                    {player.username}
                    {game.gameMode === GameMode.BUGHOUSE ? ' - TEAM ' + teamNumber : ''}
                </div>
            </div>
        </>
    )
}

export default PlayerInfo;