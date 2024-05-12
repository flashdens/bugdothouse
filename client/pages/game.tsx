import React, { useState } from "react";
import TestGame from "@/components/test/TestGame";
import Dialog from "@/components/test/Dialog";
import {getWebSocket} from "@/services/socket";
import SERVER_URL from "@/config";
import GameContext, {GameProvider} from "@/context/GameContext";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export interface Player {
    username: string,
    side: 'WHITE' | 'BLACK',
    uuid: string,
}

const Game = () => {
    const [player, setPlayer] = useState<Player | null>(null)
    const [username, setUsername] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true);

    const handleSubmit = () => {
        let socket = getWebSocket();
        if (!socket) return;

        fetch(`${SERVER_URL}/ws/ws_auth/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(responseData => {
               socket.addEventListener("open", (e) => {
                socket.send(JSON.stringify({
                    type: 'connect',
                    username: username,
                    uuid: responseData.uuid
                }))});

                socket.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    console.log(data.type);
                    if (data.type === 'connection_response') {
                        setPlayer({
                            username: username,
                            uuid: responseData.uuid,
                            side: data.side
                        });
                    }
                };
                setIsDialogOpen(false);
            })
            .catch(error => {
                console.error('Upsi:', error);
            });
    }



        return (
            <div>
                <ToastContainer/>
                <Dialog isOpen={isDialogOpen}>
                    <div className="flex flex-col items-center">
                        <label htmlFor="username" className="mb-2">Enter your username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value)
                            }}
                            className="p-2 border border-gray-300 rounded"
                        />
                        <button
                            onClick={handleSubmit}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Submit
                        </button>
                    </div>
                </Dialog>
                {(player &&
                    <TestGame
                    player={player}/>
                )}
            </div>
        );
}

export default Game;
