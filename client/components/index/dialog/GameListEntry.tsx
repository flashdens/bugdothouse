import React from "react";
import { RoomListGame } from "@/components/index/dialog/RoomListDialog";
import { GameMode } from "@/context/GameContext";
import game from "@/components/game/Game";

interface GameListEntryProps {
    room: RoomListGame;
    onJoin: () => void;
}

const GameListEntry: React.FC<GameListEntryProps> = ({ room, onJoin }) => {
    return (
        <tr className="cursor-pointer hover:bg-gray-100" onClick={onJoin}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.host.username}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.code}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{GameMode[room.gamemode]}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {room.currentPlayers}/{room.maxPlayers}
            </td>
        </tr>
    );
}

export default GameListEntry;
