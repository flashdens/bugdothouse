import React, {createContext, ReactNode, useEffect, useState, useCallback, useContext} from "react";
import SERVER_URL from "@/config";
import authContext from "@/context/AuthContext";

export enum PlayerRoles {
    'whitePlayer',
    'blackPlayer',
    'spectator'
}

export interface Player {
    id: number,
    username: string
    email: string,
}

export interface GameContextData {
    status: "waiting_for_start" | "ongoing" | "finished";
    fen: string;
    spectators: any[],
    gameCode: string,
    sideToMove: boolean,
    whitePlayer: Player,
    blackPlayer: Player,
    host: Player,
    whitePocket: {[key: string]: number},
    blackPocket: {[key: string]: number},
    localPlayerIs: PlayerRoles
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
    const {user} = useContext(authContext);

    const updateGameContext = useCallback((data: Partial<GameContextData>) => {
        if (!data) return;
        console.log("updating with", data);
        let localPlayerIs: PlayerRoles| null = null
        if (data.blackPlayer && data.blackPlayer.id === user?.user_id) {
            localPlayerIs = PlayerRoles.blackPlayer;
        } else if (data.whitePlayer && data.whitePlayer.id === user?.user_id) {
            localPlayerIs = PlayerRoles.whitePlayer;
        } else {
            localPlayerIs = PlayerRoles.spectator;
        }

        setContextData((prevData) => ({
            ...prevData,
            ...data,
            localPlayerIs: localPlayerIs
        }));
    }, []);

    const fetchGameData = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${SERVER_URL}/api/${contextData?.gameCode}/info/`);
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
