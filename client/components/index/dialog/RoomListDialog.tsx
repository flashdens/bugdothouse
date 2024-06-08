import SERVER_URL from "@/config";
import authContext from "@/context/AuthContext";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Dialog from "@/components/Dialog";
import { GameMode, Player } from "@/context/GameContext";
import GameListEntry from "@/components/index/dialog/GameListEntry";
import Image from "next/image";
import refresh from "@/public/refresh.svg";

interface RoomListDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface RoomListGame {
    code: string,
    host: Player,
    gamemode: GameMode,
    maxPlayers: number,
    currentPlayers: number,
    spectators: number
}

const RoomListDialog: React.FC<RoomListDialogProps> = ({ isOpen, onClose }) => {
    const { authTokens, loginUser } = useContext(authContext);
    const router = useRouter();
    const [roomList, setRoomList] = useState<RoomListGame[]>([]);

    const fetchRoomList = () => {
        fetch(`${SERVER_URL}/api/games/`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => setRoomList(data))
            .catch(error => console.log(error));
    };

    useEffect(() => {
        fetchRoomList();
    }, []);

    const joinGame = async (gameCode: string) => {
        fetch(`${SERVER_URL}/api/${gameCode}/join/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...authTokens && { authTokens },
            }),
        })
            .then(response => {
                if (!response.ok) throw new Error('error joining game...');
                return response.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                if (data.guestToken) loginUser(undefined, data.guestToken);
                router.push(`/${gameCode}`);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleRefresh = () => {
        fetchRoomList();
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Room list"
                animation={"animate-in slide-in-from-bottom duration-300"}>
            {roomList.length === 0 ? (
                <p>No active lobbies found. Why not create one?</p>
            ) : (
                <>
                    <p className={"text-center my-2"}>Click to join</p>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gamemode
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spectators</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {roomList.map((room, index) => (
                                <GameListEntry key={index} room={room} onJoin={() => joinGame(room.code)}/>
                            )
                        )}
                        </tbody>
                    </table>
                </>
            )}

            <div className="flex justify-center items-center">
               <button onClick={handleRefresh} className={"border p-2 mt-6 flex justify-center items-center"}>
                        <Image src={refresh} alt={"refresh"} width={20} height={20}/>
               </button>
            </div>

        </Dialog>
    );
}

export default RoomListDialog;
