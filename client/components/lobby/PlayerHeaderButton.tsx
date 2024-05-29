import React, {useContext} from "react";
import GameContext, {Player} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";

interface Props {
    player: Player | null;
    sendWSLobbyEv: (switchTo: string, subgameId: number) => void;
    sendWSAIEv: (toSide: string, toSubgame: number, msgType: 'aiAdd' | 'aiRemove') => void,
    switchTo: string;
    subgameId: number
}

const PlayerHeaderButton: React.FC<Props> = ({ player, sendWSLobbyEv, sendWSAIEv, switchTo, subgameId }) => {
    const playerColor = switchTo.slice(0, switchTo.indexOf("Player"));
    const {user} = useContext(AuthContext);
    const {gameContextData} = useContext(GameContext);
    return (
        <>
            <h3>{playerColor} player:</h3>
            {player
                ? player.username
                :
                <>
                    <button
                        onClick={() => sendWSLobbyEv(switchTo, subgameId)}
                        className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    >
                        Play as {playerColor}
                    </button>
                    {user?.user_id == gameContextData?.host.id
                    &&
                        <>
                            <button
                                className={"bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"}
                                onClick={() => {
                                    sendWSAIEv(switchTo, subgameId, 'aiAdd');
                                }}
                            >
                                Add AI
                            </button>
                            <button
                                className={"bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"}
                                onClick={() => {
                                    sendWSAIEv(switchTo, subgameId, 'aiRemove');
                                }}
                            >
                                Remove AI
                            </button>
                        </>
                    }
                </>
            }
        </>
    );
}

export default PlayerHeaderButton;
