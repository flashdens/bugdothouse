import PlayerHeaderButton from "@/components/lobby/PlayerHeaderButton";
import Image from "next/image";
import chessboard from "@/public/chessboard.png";
import chessboard_reversed from "@/public/chessboardReversed.png"
import React from "react";
import {Player} from "@/context/GameContext";

/**
 * @interface SubLobbyProps
 * @brief Props komponentu SubLobby.
 *
 * @property {Player | null} blackPlayer gracz czarny.
 * @property {Player | null} whitePlayer gracz biały.
 * @property {function} sendWSLobbyEvent callback do funkcji wysyłającej zdarzenie typu "lobby" do gniazdka WebSocket.
 * @property {function} sendWSAIEvent callback do funkcji wysyłającej zdarzenie typu "ai" do gniazdka WebSocket.
 * @property {subgameId} subgameId identifkator podgry.
 */
interface SubLobbyProps {
    blackPlayer: Player | null,
    whitePlayer: Player | null,
    sendWSLobbyEvent: (switchTo: string) => void,
    sendWSAIEvent: (toSide: string, toSubgame: number, msgType: 'aiAdd' | 'aiRemove') => void,
    subgameId: number
}

const isOdd = (num: number) => {
    return num % 2 !== 0;
}

const SubLobby: React.FC<SubLobbyProps> = ({whitePlayer,blackPlayer, sendWSLobbyEvent, sendWSAIEvent, subgameId,}) => {

    const topPlayer = isOdd(Number(subgameId)) ? blackPlayer : whitePlayer
    const bottomPlayer = (blackPlayer === topPlayer) ? whitePlayer : blackPlayer

    return(
        <div>
            <h2>Game {subgameId}:</h2>
            <PlayerHeaderButton
                player={topPlayer}
                sendWSLobbyEv={sendWSLobbyEvent}
                sendWSAIEv={sendWSAIEvent}
                switchTo={isOdd(Number(subgameId)) ? 'blackPlayer' : 'whitePlayer'}
                subgameId={subgameId}
           />
            <Image
                src={isOdd(Number(subgameId)) ? chessboard : chessboard_reversed}
                alt="chessboard"
                className="w-64 h-64 my-3" />
            <PlayerHeaderButton
                player={bottomPlayer}
                sendWSLobbyEv={sendWSLobbyEvent}
                sendWSAIEv={sendWSAIEvent}
                switchTo={isOdd(Number(subgameId)) ? 'whitePlayer' : 'blackPlayer'}
                subgameId={subgameId}
           />
        </div>
    );
}

export default SubLobby;