import React from "react";
import { Player } from "@/context/GameContext";

interface Props {
    player: Player | null;
    wsSendCallback: (switchTo: string) => void;
    switchTo: 'whitePlayer' | 'blackPlayer' | 'spectator';
    color: 'black' | 'white';
}

const PlayerHeaderButton: React.FC<Props> = ({ player, wsSendCallback, switchTo, color }) => {
    return (
        <>
            <h3>{color} player:</h3>
            {player
                ? player.username
                :
                <button
                    onClick={() => wsSendCallback(switchTo)}
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                >
                    Play as {color}
                </button>
            }
        </>
    );
}

export default PlayerHeaderButton;
