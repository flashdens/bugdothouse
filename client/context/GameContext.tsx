import React, { createContext, ReactNode, useEffect, useState } from "react";
import AuthContext from "@/context/AuthContext";
import SERVER_URL from "@/config";

interface GameContextData {
    fen: string;
    sideToMove: boolean;
    whitePlayerName: string;
    blackPlayerName: string;
    whitePocket: string[];
    blackPocket: string[];
}

const GameContext = createContext<GameContextData | null>(null);
export default GameContext;

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contextData, setContextData] = useState<GameContextData | null>(null);

    useEffect(() => {
        fetch(`${SERVER_URL}/api/test/game_info/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then((data: GameContextData) => {
                // Set contextData with fetched game data
                setContextData({
                    fen: data.fen,
                    sideToMove: data.sideToMove,
                    whitePlayerName: data.whitePlayerName,
                    blackPlayerName: data.blackPlayerName,
                    whitePocket: data.whitePocket,
                    blackPocket: data.blackPocket,
                });
            })
            .catch(error => {
                console.error('Error fetching game info:', error);
            });
    }, []);

    return (
        <GameContext.Provider value={contextData}>
            {children}
        </GameContext.Provider>
    );
};
