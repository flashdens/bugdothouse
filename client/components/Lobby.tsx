import React, { useContext, useEffect } from "react";
import GameContext, { GameContextData, PlayerRoles } from "@/context/GameContext";
import chessboard from '@/public/chessboard.png';
import Image from 'next/image';
import getWebSocket from "@/services/socket";
import authContext from "@/context/AuthContext";
import PlayerHeaderButton from "@/components/lobby/PlayerHeaderButton";
import SpectatorList from "@/components/lobby/SpectatorList";
import MoveToSpectatorsButton from "@/components/lobby/MoveToSpectatorsButton";
import StartGameButton from "@/components/lobby/StartGameButton";

interface LobbyProps {
    gameData: GameContextData;
}

const Lobby: React.FC<LobbyProps> = ({ gameData }) => {
    const { gameContextData, updateGameContext, fetchGameData } = useContext(GameContext);
    const {authTokens} = useContext(authContext);
    const socket: WebSocket | null = getWebSocket(gameData.code);

    useEffect(() => {
        updateGameContext(gameData);

        if (socket) {
            socket.onopen = () => {
                socket.send(JSON.stringify({ type: 'connect' }));
            }


        }

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    if (!gameContextData) {
        return (<h3>Loading...</h3>);
    }

    const { code, whitePlayer, blackPlayer, spectators } = gameContextData;

    const sendWSLobbyEvent = (switchTo: string) => {
        if (socket) {
            socket.send(JSON.stringify({
                type: 'lobbySwitch',
                switchFrom: gameContextData.localPlayerIs,
                switchTo: PlayerRoles[switchTo as keyof typeof PlayerRoles],
                token: authTokens.access,
            }));
            socket.onmessage = (event) => {
                console.log('Received WebSocket message:', event.data);
                const data = JSON.parse(event.data);
                if (data.type == 'lobbySwitch' || data.type == 'connect') {
                    fetchGameData();
                }
            };
        }

    };

    const startGame = () => {
        console.log('starting game...');
    }

    return (
        <>
            <h1>This is a lobby page. Lobby ID: {code}</h1>
            <div className="flex flex-col items-center h-screen">
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
                <SpectatorList spectators={spectators}/>
                <MoveToSpectatorsButton wsSendCallback={sendWSLobbyEvent}/>
                <StartGameButton startGame={startGame}/>
            </div>
        </>
    );
};

export default Lobby;