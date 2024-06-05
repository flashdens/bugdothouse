import React from "react";
import {Player} from "@/context/GameContext";

interface PlayerInfoProps {
    player: Player,
    playerColor: 'WHITE' | 'BLACK',
    sideToMove: boolean,
}


const PlayerInfo: React.FC<PlayerInfoProps> = ({player, playerColor, sideToMove}) => {

    const WHITE: boolean = true;
    const BLACK: boolean = false;

    const isPlayerTurn =
        (playerColor === 'WHITE' && sideToMove == WHITE)
        || (playerColor == 'BLACK' && sideToMove == BLACK)

    return(
        <>
            <div className="flex justify-between items-center w-full">
                <div className={`flex-1 text-center ${isPlayerTurn ? 'bg-green-500' : ''}`}>
                    {player.username}
                </div>
                <div className="text-right whitespace-nowrap">
                    5:00
                </div>
            </div>
        </>
    )
}

export default PlayerInfo;