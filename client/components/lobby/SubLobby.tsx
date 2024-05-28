import PlayerHeaderButton from "@/components/lobby/PlayerHeaderButton";
import Image from "next/image";
import chessboard from "@/public/chessboard.png";
import React from "react";
import {Player} from "@/context/GameContext";

interface SubLobbyProps {
    blackPlayer: Player,
    whitePlayer: Player,
    sendWSLobbyEvent: (switchTo: string) => void,
}

const SubLobby: React.FC<SubLobbyProps> = ({whitePlayer, blackPlayer, sendWSLobbyEvent}) => {

    return(
        <div>
            <PlayerHeaderButton
                player={blackPlayer}
                wsSendCallback={sendWSLobbyEvent}
                switchTo={'blackPlayer'}
                color={'black'}
           />
            <Image
                src={chessboard}
                alt="chessboard"
                className="w-64 h-64 my-3" />
            <PlayerHeaderButton
                player={whitePlayer}
                wsSendCallback={sendWSLobbyEvent}
                switchTo={'whitePlayer'}
                color={'white'}
           />
        </div>
    );
}

export default SubLobby;