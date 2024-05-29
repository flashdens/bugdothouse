import React, {createContext, ReactNode, useEffect, useState, useCallback, useContext} from "react";
import SERVER_URL from "@/config";
import authContext from "@/context/AuthContext";

export enum PlayerRole {
    'whitePlayer',
    'blackPlayer',
    'spectator'
}

export enum GameOutcome {
    WHITE_WIN = 0,
    BLACK_WIN = 1,
    TEAM_1_WIN = 2,
    TEAM_2_WIN = 3,
    DRAW = 4
}

export enum GameStatus {
    WAITING_FOR_START = 0,
    ONGOING = 1,
    FINISHED = 2,
}

export enum GameMode {
    BUGHOUSE = 0,
    CRAZYHOUSE = 1,
    CLASSICAL = 2,
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
    whitePlayer: Player | null,
    blackPlayer: Player | null,
    localPlayerIs: PlayerRole,
}

export interface GameContextData {
    status: GameStatus,
    gameMode: GameMode,
    gameCode: string,
    spectators: Player[] | null,
    host: Player,
    result: GameOutcome,
    boards: { [subgameId: string]: BoardData };
}

interface GameContextValue {
    gameContextData: GameContextData | null,
    loading: boolean,
    error: string | null,
    updateGameContext: (data: Partial<GameContextData>) => void;
    fetchGameData: (gameCode: string) => void;
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
    const [contextData, setContextData] = useState<GameContextData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {user} = useContext(authContext);

    const updateGameContext = (data: Partial<GameContextData>) => {
        if (!data) return;
        console.log("updating with", data);
        for (const subgameId in data.boards) {
            const board = data.boards[subgameId];
            let localPlayerIs: PlayerRole| null = null;
            if (board.blackPlayer && board.blackPlayer.id === user?.user_id) {
                localPlayerIs = PlayerRole.blackPlayer;
            } else if (board.whitePlayer && board.whitePlayer.id === user?.user_id) {
                localPlayerIs = PlayerRole.whitePlayer;
            } else {
                localPlayerIs = PlayerRole.spectator;
            }
                board.localPlayerIs = localPlayerIs;
        }


        setContextData((prevData) => ({
            ...prevData,
            ...data,
        }));
    }

    const fetchGameData = async (gameCode: string) => {
        try {
            setLoading(true);
            console.log(gameCode);
            const response = await fetch(
                `${SERVER_URL}/api/${gameCode}/info/`);
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
