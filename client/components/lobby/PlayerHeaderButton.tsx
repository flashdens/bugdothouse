import React, {useContext, useState} from "react";
import GameContext, {Player} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";
import AIMgmtButton from "@/components/lobby/AIMgmtButton";
import MoveToSpectatorsButton from "@/components/lobby/MoveToSpectatorsButton";

/**
 * @interface Props
 * @brief Props komponentu PlayerHeaderButton.
 *
 * @property {player | null} player gracz, który zajmuje daną stronę w grze.
 * @property {function} sendWSLobbyEv funkcja wysyłające zdarzenie typu 'lobby' do gniazdka WebSocket.
 * @property {function} sendWSAIEv funkcja wysyłające zdarzenie typu 'aiAdd' lub 'aiRemove' do gniazdka WebSocket.
 * @property {string} switchTo strona, którą zajmuje lub ma zająć gracz.
 * @property {number} subgameId nr podgry, której dotyczy przycisk.
 */
interface Props {
    player: Player | null;
    sendWSLobbyEv: (switchTo: string, subgameId?: number) => void;
    sendWSAIEv: (toSide: string, toSubgame: number, msgType: 'aiAdd' | 'aiRemove') => void,
    switchTo: string;
    subgameId: number
}

const PlayerHeaderButton: React.FC<Props> = ({ player, sendWSLobbyEv, sendWSAIEv, switchTo, subgameId }) => {
    const [isAIPlayerSet, setIsAIPlayerSet] = useState<boolean>(false);
    const playerColor = switchTo.slice(0, switchTo.indexOf("Player"));
    const colorEmoji = playerColor == 'white' ? '🤍' : '🖤'
    const {user} = useContext(AuthContext);
    const {game} = useContext(GameContext);
    return (
        <>
            {player ? (
                <>
                    <h1
                        className={user?.user_id === player.id ? "font-bold" : ""}
                    >
                        {playerColor} player: {player.username} {player.id == game?.host.id && '👑'}</h1>
                    {player.username == 'bugdothouse_ai' &&
                    <AIMgmtButton
                        setIsAIPlayerSet={setIsAIPlayerSet}
                        sendWSAIEv={sendWSAIEv}
                        switchTo={switchTo}
                        subgameId={subgameId}
                        msgType={'aiRemove'}
                    />
                    }
                     {player.id === user?.user_id &&
                     <MoveToSpectatorsButton
                     wsSendCallback={sendWSLobbyEv}
                     />
                     }
                </>
                ) :
                <>
                    {playerColor} player: <br/>
                    <button
                        onClick={() => sendWSLobbyEv(switchTo, subgameId)}
                        className="blue-button"
                    >
                        Play as {playerColor} {colorEmoji}
                    </button>
                    {user?.user_id == game?.host.id
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
