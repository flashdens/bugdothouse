import React from "react";
import {Player, PlayerRole} from "@/context/GameContext";

interface Props {
    player: Player | null;
    wsSendCallback: (switchTo: string, subgameId: number) => void;
    switchTo: string;
    subgameId: number
}

const PlayerHeaderButton: React.FC<Props> = ({ player, wsSendCallback, switchTo, subgameId }) => {
    return (
        <>
            <h3>{switchTo} player:</h3>
            {player
                ? player.username
                :
                <button
                    onClick={() => wsSendCallback(switchTo, subgameId)}
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                >
                    Play as {switchTo.slice(0, switchTo.indexOf("Player"))}
                </button>
            }
        </>
    );
}

export default PlayerHeaderButton;
