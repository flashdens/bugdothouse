import React, { useState } from "react";
import { useRouter } from 'next/router';
import Dialog from "@/components/Dialog";
import { toast } from "react-toastify";
import SERVER_URL from "@/config";

interface JoinWithCodeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const JoinWithCodeDialog: React.FC<JoinWithCodeDialogProps> = ({ isOpen, onClose }) => {
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        const gameCode = extractGameCode(inputValue);
        console.log(gameCode)
        if (gameCode) {
            const pageExists = await gameExists(gameCode);
            if (pageExists) {
                await router.push(`/${gameCode}`);
            } else {
                toast.error('Game does not exist');
            }
        }
    };

    const extractGameCode = (input: string): string => {
        const regex = /\/?([A-Za-z0-9]+)\/?$/;
        const match = input.match(regex);
        return match ? match[1] : '';
    };

    const gameExists = async (gameCode: string): Promise<boolean> => {
        const response = await fetch(`${SERVER_URL}/api/${gameCode}/info/`);
        return response.ok;
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Join with game code"
            animation={"animate-in slide-in-from-bottom duration-300"}
        >
            <div className="flex flex-col items-center space-y-4 p-4">
                <p className="text-lg font-medium">Got a game code?</p>
                <input
                    className="border border-gray-300 rounded px-4 py-2 w-full text-center"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter game code or link"
                />
                <div className="flex justify-center w-full">
                    <button
                        className="blue-button"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </Dialog>
    );
}

export default JoinWithCodeDialog;
