import React, { createContext, ReactNode, useEffect, useState, useCallback } from "react";
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
    contextData: GameContextData | null;
    loading: boolean;
    error: string | null;
    updateGameContext: (data: Partial<GameContextData>) => void;
}

const GameContext = createContext<GameContextValue>({
    contextData: null,
    loading: false,
    error: null,
    updateGameContext: () => {},
});
export default GameContext;

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contextData, setContextData] = useState<GameContextData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateGameContext = useCallback((data: Partial<GameContextData>) => {
        if (!data) return;
        console.log("updating with", data);
        // @ts-ignore
        setContextData((prevData) => ({
            ...prevData,
            ...data,
        }));
    }, []);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${SERVER_URL}/api/test/game_info/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch game info");
                }
                const data: GameContextData = await response.json();
                updateGameContext(data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGameData();
    }, [updateGameContext]);

    return (
        <GameContext.Provider value={{ contextData, loading, error, updateGameContext }}>
            {children}
        </GameContext.Provider>
    );
};
