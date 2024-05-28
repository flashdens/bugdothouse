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

export interface BoardData{
    fen: string,
    whitePocket: {[key: string]: number},
    blackPocket: {[key: string]: number},
    sideToMove: boolean
    whitePlayer: Player,
    blackPlayer: Player
}

export interface GameData {
    status: "waiting_for_start" | "ongoing" | "finished";
    fen: string;
    spectators: any[],
    gameCode: string,
    sideToMove: boolean,
    whitePlayer: Player,
    blackPlayer: Player,
    host: Player,
    localPlayerIs: PlayerRoles
}

interface GameContextValue {
    gameContextData: GameData[] | null;
    loading: boolean;
    error: string | null;
    updateGameContext: (data: Partial<GameData>, id: number) => void;
    fetchGameData: (gameCode: string, id: number) => void;
}

const GameContext = createContext<GameContextValue>({
    gameContextData: null,
    loading: false,
    error: null,
    updateGameContext: () => {},
    fetchGameData: (gameCode: string) => {},
});
export default GameContext;

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contextData, setContextData] = useState<GameData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {user} = useContext(authContext);

    const updateGameContext = useCallback((data: Partial<GameData>) => {
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

    const fetchGameData = async (gameCode: string) => {
        try {
            setLoading(true);
            console.log(gameCode);
            const response = await fetch(
                `${SERVER_URL}/api/${gameCode}/info/`);
            if (!response.ok) {
                new Error("Failed to fetch game info");
            }
            const data: GameData = await response.json();
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
