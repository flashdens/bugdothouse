import PlayerHeaderButton from "@/components/lobby/PlayerHeaderButton";
import Image from "next/image";
import chessboard from "@/public/chessboard.png";
import React from "react";
import {Player} from "@/context/GameContext";

interface SubLobbyProps {
    blackPlayer: Player | null,
    whitePlayer: Player | null,
    sendWSLobbyEvent: (switchTo: string) => void,
    subgameId: number
}

const SubLobby: React.FC<SubLobbyProps> = ({whitePlayer, blackPlayer, sendWSLobbyEvent, subgameId}) => {

    return(
        <div>
            <h2>Game {subgameId}:</h2>
            <PlayerHeaderButton
                player={blackPlayer}
                wsSendCallback={sendWSLobbyEvent}
                switchTo={'blackPlayer'}
                subgameId={subgameId}
           />
            <Image
                src={chessboard}
                alt="chessboard"
                className="w-64 h-64 my-3" />
            <PlayerHeaderButton
                player={whitePlayer}
                wsSendCallback={sendWSLobbyEvent}
                switchTo={'whitePlayer'}
                subgameId={subgameId}
           />
        </div>
    );
}

export default SubLobby;