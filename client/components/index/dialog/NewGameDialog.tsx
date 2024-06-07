// NewGameDialog.tsx
import React, {useContext, useState} from 'react';
import Dialog from "@/components/Dialog";
import SERVER_URL from "@/config";
import AuthContext from "@/context/AuthContext";
import {useRouter} from 'next/router'
import {GameMode} from "@/context/GameContext";

interface NewGameDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewGameDialog: React.FC<NewGameDialogProps> = ({ isOpen, onClose }) => {
    const [gamemode, setGamemode] = useState<GameMode | undefined>(undefined);
    const [roomType, setRoomType] = useState("");

    const {user, authTokens} = useContext(AuthContext);

    const router = useRouter();
    const gamemodeSpans: Record<GameMode, string> = {
        [GameMode.BUGHOUSE]: '4 Players',
        [GameMode.CRAZYHOUSE]: '2 Players',
        [GameMode.CLASSICAL]: '2 Players',
    }

    const roomTypeSpans: Record<string, string> = {
        public: 'Visible on the room list',
        private: 'Only can join with link',
    }

    const onCreateGame = () => {
        console.log('creating...', gamemode, roomType);
        if (!user || gamemode === undefined || !roomType) return;
        fetch(`${SERVER_URL}/api/new_game/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
            },
            body: JSON.stringify({
                user: user.user_id,
                gamemode: gamemode,
                roomType: roomType,
            })
        })
            .then(response => {
                if (!response.ok)
                    throw new Error('error creating lobby');
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

    const handleRoomTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRoomType(event.target.value);
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Create New Game"
                animation={"animate-in slide-in-from-bottom duration-300"}
        >
            <div className="flex flex-col items-center">
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

                <label className="mb-2">Room type:</label>
                <select
                    value={roomType}
                    onChange={handleRoomTypeChange}
                    className={"mb-2"}
                >
                    <option value="">--Select--</option>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                </select>
                {roomType && (
                    <span className="mb-2 text-xs">{roomTypeSpans[roomType]}</span>
                )}
                <button onClick={onCreateGame} className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Create Game
                </button>
            </div>
        </Dialog>
    );
};

export default NewGameDialog;
