import React from 'react';
import { Player } from '@/context/GameContext';

interface Props {
    spectators: Player[];
}

const SpectatorList: React.FC<Props> = ({ spectators }) => {
    return (
        <div>
            <h3>Spectators:</h3>
            <ul>
                {spectators.map((spectator, index) => (
                    <li key={index}>{spectator.username}</li>
                ))}
            </ul>
        </div>
    );
}

export default SpectatorList;
