import SERVER_URL from "@/config";
import authContext from "@/context/AuthContext";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Dialog from "@/components/Dialog";
import { GameMode, Player } from "@/context/GameContext";
import GameListEntry from "@/components/index/dialog/GameListEntry";
import Image from "next/image";
import refresh from "@/public/refresh.svg";
import axiosInstance from "@/services/axiosInstance";

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

const GameListDialog: React.FC<RoomListDialogProps> = ({ isOpen, onClose }) => {
    const { authTokens, loginUser } = useContext(authContext);
    const router = useRouter();
    const [roomList, setRoomList] = useState<RoomListGame[]>([]);

    const fetchRoomList = async () => {
        try {
          const response = await axiosInstance.get('/games/');
          setRoomList(response.data);
        } catch (error) {
          console.error('Error fetching room list:', error);
        }
    };

    useEffect(() => {
        void fetchRoomList();
    }, []);

    const handleRefresh = () => {
        void fetchRoomList();
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
                                <GameListEntry key={index} room={room} onJoin={() => router.push(`/${room.code}`) }/>
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

export default GameListDialog;
