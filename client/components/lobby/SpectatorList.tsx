import React, { useContext } from 'react';
import { Player } from '@/context/GameContext';
import authContext from "@/context/AuthContext";

/**
 * @interface SpectatorListProps
 * @brief Props komponentu SpectatorList
 *
 * @property {Player[] | null} spectators tablica graczy obserwujących grę.
 * @property {number} hostId ID gospodarza gry.
 */
interface SpectatorListProps {
    spectators: Player[] | null;
    hostId: number;
}

const SpectatorList: React.FC<SpectatorListProps> = ({ spectators, hostId }) => {
    const { user } = useContext(authContext);
    if (!user) return null;

    return (
        <div className="p-3 mt-2 max-h-24 overflow-y-auto">
            <h3>Spectators:</h3>
            <ul>
                {spectators?.map((spectator, index) => (
                    <li
                        key={index}
                        className={user.user_id === spectator.id ? "font-bold" : ""}
                    >
                        {spectator.username} {spectator.id === hostId && '👑'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SpectatorList;
