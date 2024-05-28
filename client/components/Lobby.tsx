import React, { useContext, useEffect } from "react";
import GameContext, { GameData, PlayerRoles } from "@/context/GameContext";
import chessboard from '@/public/chessboard.png';
import Image from 'next/image';
import getWebSocket from "@/services/socket";
import authContext from "@/context/AuthContext";
import PlayerHeaderButton from "@/components/lobby/PlayerHeaderButton";
import SpectatorList from "@/components/lobby/SpectatorList";
import MoveToSpectatorsButton from "@/components/lobby/MoveToSpectatorsButton";
import StartGameButton from "@/components/lobby/StartGameButton";
import SERVER_URL from "@/config";
import {router} from "next/client";
import SubLobby from "@/components/lobby/SubLobby";

interface LobbyProps {
    gameData: GameData;
    rerenderParent: () => void
}

const Lobby: React.FC<LobbyProps> = ({ gameData, rerenderParent }) => {
    const { gameContextData, updateGameContext, fetchGameData } = useContext(GameContext);
    const {user, authTokens} = useContext(authContext);
    const socket: WebSocket | null = getWebSocket(gameData.gameCode);

    useEffect(() => {
        updateGameContext(gameData);

        if (socket) {
            socket.onopen = () => {
                socket.send(JSON.stringify({ type: 'connect' }));
            }

            socket.onmessage = (event) => {
                console.log('Received WebSocket message:', event.data);
                const data = JSON.parse(event.data);
                if (data.type === 'lobbySwitch' || data.type === 'connect') {
                    fetchGameData(gameData.gameCode);
                }
                else if (data.type == 'gameStart') {
                    fetchGameData(gameData.gameCode);
                    rerenderParent();
                }
            }
        }

        // return () => {
        //     if (socket?.readyState === 1)
        //         socket?.close();
        // };

    }, [socket]);

    if (!gameContextData) {
        return (<h3>Loading...</h3>);
    }

    const { gameCode, whitePlayer, blackPlayer, spectators, host } = gameContextData;

    const sendWSLobbyEvent = (switchTo: string, toSubgame: number = 1) => {
        if (socket) {
            socket.send(JSON.stringify({
                type: 'lobbySwitch',
                toSubgame: toSubgame,
                switchFrom: gameContextData.localPlayerIs,
                switchTo: PlayerRoles[switchTo as keyof typeof PlayerRoles],
                token: authTokens.access,
            }));
        }

    };

    const startGame = () => {
        fetch(`${SERVER_URL}/api/${gameCode}/start/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
            },
        })
            .then(response => {
                if (!response.ok)
                    throw new Error('upsi');
                else {
                    // response ok -> game started
                    socket?.send(JSON.stringify({ 'type': 'gameStart' }));
                    return response.json();
                }
            })

    }

    return (
        <>
            <h1>This is a lobby page. Lobby ID: {gameCode}</h1>
            <div className="flex flex-col items-center h-screen">
            <SubLobby whitePlayer={gameContextData[0].whitePlayer}
                      blackPlayer={gameContextData[0].blackPlayer}
                      sendWSLobbyEvent={sendWSLobbyEvent}
            />
                <SubLobby whitePlayer={gameContextData[1].whitePlayer}
                      blackPlayer={gameContextData[1].blackPlayer}
                      sendWSLobbyEvent={sendWSLobbyEvent}

                />
                <SpectatorList spectators={spectators}/>
                <MoveToSpectatorsButton wsSendCallback={sendWSLobbyEvent}/>
                { host.id === user?.user_id
                    ? <StartGameButton
                        startGame={startGame}
                        isDisabled={!whitePlayer || !blackPlayer}/>
                    : <p>Waiting for start...</p>
                }
            </div>
        </>
    );
};

export default Lobby;
