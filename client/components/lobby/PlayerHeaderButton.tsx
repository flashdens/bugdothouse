import React, {useContext, useState} from "react";
import GameContext, {Player} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";
import AIMgmtButton from "@/components/lobby/AIMgmtButton";

interface Props {
    player: Player | null;
    sendWSLobbyEv: (switchTo: string, subgameId: number) => void;
    sendWSAIEv: (toSide: string, toSubgame: number, msgType: 'aiAdd' | 'aiRemove') => void,
    switchTo: string;
    subgameId: number
}

const PlayerHeaderButton: React.FC<Props> = ({ player, sendWSLobbyEv, sendWSAIEv, switchTo, subgameId }) => {
    const [isAIPlayerSet, setIsAIPlayerSet] = useState<boolean>(false);
    const playerColor = switchTo.slice(0, switchTo.indexOf("Player"));
    const {user} = useContext(AuthContext);
    const {gameContextData} = useContext(GameContext);
    return (
        <>
            <h3>{playerColor} player:</h3>
            {player ? (
                <>
                    <h1>{player.username}</h1>
                    <AIMgmtButton
                        setIsAIPlayerSet={setIsAIPlayerSet}
                        sendWSAIEv={sendWSAIEv}
                        switchTo={switchTo}
                        subgameId={subgameId}
                        msgType={'aiRemove'}
                    />
                </>
                ) :
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
                            {!isAIPlayerSet && (
                            <AIMgmtButton
                                setIsAIPlayerSet={setIsAIPlayerSet} 
                                sendWSAIEv={sendWSAIEv}
                                switchTo={switchTo}
                                subgameId={subgameId} 
                                msgType={'aiAdd'}
                            />
                            )}
                        </>
                    }
                </>
            }
        </>
    );
}

export default PlayerHeaderButton;
