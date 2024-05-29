import PlayerHeaderButton from "@/components/lobby/PlayerHeaderButton";
import Image from "next/image";
import chessboard from "@/public/chessboard.png";
import React from "react";
import {Player} from "@/context/GameContext";

interface SubLobbyProps {
    blackPlayer: Player | null,
    whitePlayer: Player | null,
    sendWSLobbyEvent: (switchTo: string) => void,
    sendWSAIEvent: (toSide: string, toSubgame: number, msgType: 'aiAdd' | 'aiRemove') => void,
    subgameId: number
}

const SubLobby: React.FC<SubLobbyProps> = ({whitePlayer,blackPlayer, sendWSLobbyEvent, sendWSAIEvent, subgameId,}) => {

    return(
        <div>
            <h2>Game {subgameId}:</h2>
            <PlayerHeaderButton
                player={blackPlayer}
                sendWSLobbyEv={sendWSLobbyEvent}
                sendWSAIEv={sendWSAIEvent}
                switchTo={'blackPlayer'}
                subgameId={subgameId}
           />
            <Image
                src={chessboard}
                alt="chessboard"
                className="w-64 h-64 my-3" />
            <PlayerHeaderButton
                player={whitePlayer}
                sendWSLobbyEv={sendWSLobbyEvent}
                sendWSAIEv={sendWSAIEvent}
                switchTo={'whitePlayer'}
                subgameId={subgameId}
           />
        </div>
    );
}

export default SubLobby;