import React, { useContext, useEffect } from "react";
import GameContext, { GameContextData } from "@/context/GameContext";
import chessboard from '@/public/chessboard.png';
import Image from 'next/image';
import getWebSocket from "@/services/socket";

interface LobbyProps {
    gameData: GameContextData;
}

const Lobby: React.FC<LobbyProps> = ({ gameData }) => {
    const { gameContextData, updateGameContext, fetchGameData } = useContext(GameContext);
    const socket: WebSocket | null = getWebSocket(gameData.code);

    useEffect(() => {
        updateGameContext(gameData);

        if (socket) {
            socket.onmessage = (event) => {
                // Handle incoming WebSocket messages here
                console.log('Received WebSocket message:', event.data);
                const data = JSON.parse(event.data);
                if (data.success) {
                    fetchGameData();
                }
            };
        }

        // Clean up the socket connection on component unmount
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    if (!gameContextData) {
        return (<h3>Loading...</h3>);
    }

    const { code, spectators } = gameContextData;

    const sendWSLobbyEvent = (switchTo: string) => {
        if (socket) {
            socket.send(JSON.stringify({
                type: 'lobby_action',
                switchFrom: gameContextData.localPlayerIs,
                switchTo: switchTo,
            }));
        }
    };

    return (
        <>
            <h1>This is a lobby page. Lobby ID: {code}</h1>
            <div className="flex flex-col items-center h-screen">
                <h3>Black player:</h3>
                <button
                    onClick={() => sendWSLobbyEvent("black")}
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                    Play as black
                </button>
                <Image
                    src={chessboard}
                    alt="chessboard1"
                    className="w-64 h-64 my-3" />
                <h3>White player:</h3>
                <button
                    onClick={() => sendWSLobbyEvent("white")}
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                    Play as white
                </button>

                <h3>Spectators:</h3>
                <ul>
                    {spectators.map((spectator: { username: string }, index: number) => (
                        <li key={index}>{spectator.username}</li>
                    ))}
                </ul>
                <button
                    onClick={() => sendWSLobbyEvent("spectator")}
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                    Move to spectators
                </button>
            </div>
        </>
    );
};

export default Lobby;
