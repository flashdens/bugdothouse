import React, { useContext, useState } from 'react';
import Dialog from "@/components/Dialog";
import SERVER_URL from "@/config";
import AuthContext from "@/context/AuthContext";
import { useRouter } from 'next/router'
import { GameMode } from "@/context/GameContext";
import {toast} from "react-toastify";

interface NewGameDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewGameDialog: React.FC<NewGameDialogProps> = ({ isOpen, onClose }) => {
    const [gamemode, setGamemode] = useState<GameMode | undefined>(undefined);
    const [isRoomPrivate, setIsRoomPrivate] = useState(false);

    const { user, authTokens } = useContext(AuthContext);

    const router = useRouter();
    const gamemodeSpans: Record<GameMode, string> = {
        [GameMode.BUGHOUSE]: '4 Players',
        [GameMode.CRAZYHOUSE]: '2 Players',
        [GameMode.CLASSICAL]: '2 Players',
    }

    const roomTypeSpans: Record<number, string> = {
        0: 'Only can join with link',
        1: 'Visible on the room list',
    }

    const onCreateGame = () => {
        console.log('creating...', gamemode, isRoomPrivate);
        if (!user) return;
        if (gamemode === undefined) {
            toast.error('Select gamemode', {hideProgressBar: true})
            return;
        }
        fetch(`${SERVER_URL}/api/new_game/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens?.access)
            },
            body: JSON.stringify({
                user: user.user_id,
                gamemode: gamemode,
                isPrivate: isRoomPrivate,
            })
        })
            .then(response => {
                if (!response.ok) {
                    toast.error('Error creating lobby');
                    return;
                }
                return response.json();
            })
            .then(data =>
                router.push(`/${data.code}`))
            .catch(error => console.error(error))
    }

    const handleGamemodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(gamemode)
        setGamemode(Number(event.target.value));
    }

    const handleRoomTypeChange = () => {
        setIsRoomPrivate(prevRoomType => !prevRoomType);
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Create New Game"
                animation={"animate-in slide-in-from-bottom duration-300"}
        >
            <div className="flex flex-col items-ce  nter">
                <label className="mb-2">Gamemode:</label>
                <select
                    value={gamemode}
                    onChange={handleGamemodeChange}
                    className={"mb-2"}
                >
                    <option value="">--Select--</option>
                    <option value={GameMode.BUGHOUSE}>Bughouse</option>
                    <option value={GameMode.CRAZYHOUSE}>Crazyhouse</option>
                    <option value={GameMode.CLASSICAL}>Classical</option>
                </select>
                {gamemode != null && (
                    <span className="mb-2 text-xs">{gamemodeSpans[gamemode]}</span>
                )}

                <label className="mb-2 flex items-center">
                    <input
                        type="checkbox"
                        checked={!isRoomPrivate}
                        onChange={handleRoomTypeChange}
                        className="mr-2"
                    />
                   Public
                </label>
                <span className="mb-2 text-lg">{roomTypeSpans[isRoomPrivate ? 0 : 1]}</span>
                <button onClick={onCreateGame} className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Create Game
                </button>
            </div>
        </Dialog>
    );
};

export default NewGameDialog;
