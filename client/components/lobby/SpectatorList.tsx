import React from 'react';
import { Player } from '@/context/GameContext';

interface Props {
    spectators: Player[] | null;
    hostId: number
}

const SpectatorList: React.FC<Props> = ({ spectators , hostId}) => {
    return (
        <div className={'p-3'}>
            <h3>Spectators:</h3>
            <ul>
                {spectators?.map((spectator, index) => (
                    <li key={index}>{spectator.username} {spectator.id === hostId && '(host)'}</li>
                ))}
            </ul>
        </div>
    );
}

export default SpectatorList;
