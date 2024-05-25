import React, { createContext, ReactNode, useEffect, useState, useCallback } from "react";
import SERVER_URL from "@/config";

export interface GameContextData {
    status: "waiting_for_start" | "ongoing" | "finished";
    fen: string;
    spectators: any[],
    code: string;
    sideToMove: boolean;
    whitePlayer: number;
    blackPlayer: number;
    whitePocket: {[key: string]: number};
    blackPocket: {[key: string]: number};
}

interface GameContextValue {
    gameContextData: GameContextData | null;
    loading: boolean;
    error: string | null;
    updateGameContext: (data: Partial<GameContextData>) => void;
    fetchGameData: () => void;
}

const GameContext = createContext<GameContextValue>({
    gameContextData: null,
    loading: false,
    error: null,
    updateGameContext: () => {},
    fetchGameData: () => {},
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

    const fetchGameData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${SERVER_URL}/api/game/${contextData?.code}/`);
            if (!response.ok) {
                new Error("Failed to fetch game info");
            }
            const data: GameContextData = await response.json();
            updateGameContext(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GameContext.Provider value={{ gameContextData: contextData, loading, error, updateGameContext, fetchGameData }}>
            {children}
        </GameContext.Provider>
    );
};
