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
    <div className={'flex'}>
        <span
            className={`place-self-center 
            ${ isPlayerTurn ? 'bg-green-500' : ''}
            `}>
            {player.username}
        </span>
        <span className={'place-self-end'}>5:00</span>
    </div>
    )
}

export default PlayerInfo;