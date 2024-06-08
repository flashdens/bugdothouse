import React, { useContext } from 'react';
import { Player } from '@/context/GameContext';
import authContext from "@/context/AuthContext";

interface Props {
    spectators: Player[] | null;
    hostId: number;
}

const SpectatorList: React.FC<Props> = ({ spectators, hostId }) => {
    const { user } = useContext(authContext);
    if (!user) return null;

    return (
        <div className="p-3 max-h-24 overflow-y-auto">
            <h3>Spectators:</h3>
            <ul>
                {spectators?.map((spectator, index) => (
                    <li
                        key={index}
                        className={user.user_id === spectator.id ? "font-bold" : ""}
                    >
                        {spectator.username} {spectator.id === hostId && '(host)'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SpectatorList;
