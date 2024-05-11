import React, {createContext, ReactNode, useEffect, useState} from "react";
import SERVER_URL from "@/config";

interface GameContextData {
    fen: string;
    sideToMove: boolean;
    whitePlayerName: string;
    blackPlayerName: string;
    whitePocket: string[];
    blackPocket: string[];
}

interface GameContextValue {
    contextData: GameContextData | null,
    updateGameContext: (data: Partial<GameContextData>) => void;
}

const GameContext = createContext<GameContextValue | null>(null);
export default GameContext;

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contextData, setContextData] = useState<GameContextData | null>(null);

    const updateGameContext = (data: Partial<GameContextData>) => {
        if (!data) return;
        console.log("updating with", data)
        setContextData((data: any) => ({
            ...contextData,
            ...data
        }));
    };

        useEffect(() => {
            fetch(`${SERVER_URL}/api/test/game_info/`)
                .then(response => {
                    return response.json();
                })
                .then((data: GameContextData) => {
                    setContextData(data);
                })
                .catch(error => {
                    console.error('Error fetching game info:', error);
                });
        }, []);


    return (
        <GameContext.Provider value={{contextData, updateGameContext}}>
            {children}
        </GameContext.Provider>
    );
};
