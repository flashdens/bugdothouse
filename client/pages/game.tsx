import React, { useState } from "react";
import TestGame from "@/components/test/TestGame";
import Dialog from "@/components/test/Dialog";

const Game = () => {
    const [username, setUsername] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true);

    const handleSubmit = () => {
        console.log("Username submitted:", username);
        setIsDialogOpen(false);
    };

    return (
        <div>
             <Dialog isOpen={isDialogOpen}>
                <div className="flex flex-col items-center">
                    <label htmlFor="username" className="mb-2">Enter your username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => {setUsername(e.target.value)}}
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
           <TestGame/>
        </div>
    );
}

export default Game;
