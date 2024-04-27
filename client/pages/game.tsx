import React, { useState } from "react";
import TestGame from "@/components/test/TestGame";
import Dialog from "@/components/test/Dialog";
import {getWebSocket} from "@/services/socket";
import SERVER_URL from "@/config";

const Game = () => {
    const [username, setUsername] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true);
    const [uuid, setUuid] = useState<string>('');

    const handleSubmit = async () => {
        let socket = getWebSocket();
        if (!socket) return;

        try {
            const response = await fetch(`${SERVER_URL}/ws/ws_auth/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username
                })
            });

            if (!response.ok) {
                new Error('Failed to fetch data');
            }

            const responseData = await response.json();

            socket.send(JSON.stringify({
                type: 'connect',
                username: username,
                uuid: responseData.uuid
            }));

            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);

                if (data.type === 'connection_response') {
                    console.log(data.side);
                }
            }
            // Close the dialog if everything is successful
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error:', error);
            // Handle errors here, such as displaying an error message to the user
        }
    }


        return (
            <div>
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
                {(!isDialogOpen &&
                    <TestGame/>
                )}
            </div>
        );
}

export default Game;
