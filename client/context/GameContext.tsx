import React, {createContext, ReactNode, useEffect, useState, useCallback, useContext} from "react";
import SERVER_URL from "@/config";
import authContext from "@/context/AuthContext";
import Game from "@/components/game/Game";
import {toast} from "react-toastify";
import api from "@/services/api";

export enum PlayerRole {
    'whitePlayer',
    'blackPlayer',
    'spectator'
}

export enum GameResult {
    WHITE_WIN = 1,
    BLACK_WIN = 2,
    TEAM_1_WIN = 3,
    TEAM_2_WIN = 4,
    DRAW = 5
}

export const GameResultStrings: Record<GameResult, string> = {
    [GameResult.WHITE_WIN]: 'White wins',
    [GameResult.BLACK_WIN]: 'Black wins',
    [GameResult.TEAM_1_WIN]: 'Team 1 wins',
    [GameResult.TEAM_2_WIN]: 'Team 2 wins',
    [GameResult.DRAW]: 'Draw'
};

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

/**
 * @interface BoardData
 * @brief Dane dotyczące planszy wchodzącej w skład gry.
 *
 * @property {string} fen pozycja na planszy w notacji FEN.
 * @property {Object} whitePocket dane nt. figur wchodzących w skład kieszeni gracza białego.
 * @property {Object} blackPocket dane nt. figur wchodzących w skład kieszeni gracza czarnego.
 * @property {boolean} sideToMove strona, która ma wykonać ruch w partii (true - białe, false - czarne)
 * @property {Player | null} whitePlayer gracz biały.
 * @property {Player | null} blackPlayer gracz czarny.
 * @property {PlayerRole} localPlayerIs kim użytkownik jest w grze białe/czarne/obesrwator
 * @property {boolean} primaryGame czy jest to gra, w której użytkownik gra którąś ze stron?
 */
export interface BoardData{
    fen: string,
    whitePocket: {[key: string]: number},
    blackPocket: {[key: string]: number},
    sideToMove: boolean
    whitePlayer: Player | null,
    blackPlayer: Player | null,
    localPlayerIs: PlayerRole,
    primaryGame: boolean,
    lastMoveFromSquare: string,
    lastMoveToSquare: string,
}

/**
 * @interface GameContextData
 *
 * @brief Dane dotyczące gry.
 *
 * @property {} status stan obecnie rozgrywanej gry.
 * @property {} gameMode wariant, w którym gra jest rozgrywana.
 * @property {string} gameCode unikalny kod reprezentujący grę.
 * @property {Player[]} spectators tablica obserwujących rozgrywkę.
 * @property {Player} host gospodarz gry.
 * @property {GameResult | null} result rezultat gry.
 * @property {Object} boards dane plansz wchodzących w skład gry.
 */
export interface GameContextData {
    status: GameStatus,
    gameMode: GameMode,
    gameCode: string,
    spectators: Player[] | null,
    host: Player,
    result: GameResult | null,
    boards: { [subgameId: string]: BoardData },
}

/**
 * @interface GameContext
 * @brief Części składowe kontekstu GameContext.
 *
 * @property {GameContextData | null} game dane dotyczące gry.
 * @property {function} updateGameContext funkcja pozwalająca na aktualizację danych gry poza plikiem konteksu.
 * @property {function} fetchGameData funkcja pobierające dane nt. gry z serwera.
 */
interface GameContext {
    game: GameContextData | null,
    updateGameContext: (data: Partial<GameContextData>) => void,
    fetchGameData: (gameCode: string) => void,
}

const GameContext = createContext<GameContext>({
    game: null,
    updateGameContext: (data: Partial<GameContextData>) => {},
    fetchGameData: (gameCode: string) => {},
});

export default GameContext;

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contextData, setContextData] = useState<GameContextData | null>(null);
    const {user} = useContext(authContext);

    const updateGameContext = (data: Partial<GameContextData>) => {
        if (!data) return;

        console.log('updating with', data);
            for (const subgameId in data.boards) {
                const board = data.boards[subgameId];
                if (data.spectators) { // if spectators are fetched, then it's the initial data fetch
                    if (board.blackPlayer && board.blackPlayer.id === user?.user_id) {
                        board.localPlayerIs = PlayerRole.blackPlayer;
                        board.primaryGame = true;
                    } else if (board.whitePlayer && board.whitePlayer.id === user?.user_id) {
                        board.localPlayerIs = PlayerRole.whitePlayer;
                        board.primaryGame = true;
                    } else {
                        board.localPlayerIs = PlayerRole.spectator;
                    }
                }
                else {
                    // todo update doesn't keep these values?
                    board.localPlayerIs = contextData?.boards[subgameId].localPlayerIs;
                    board.primaryGame = contextData?.boards[subgameId].primaryGame;
                    board.whitePlayer = contextData?.boards[subgameId].whitePlayer;
                    board.blackPlayer = contextData?.boards[subgameId].blackPlayer;
                }
            }

        setContextData((prevData) => ({
            ...prevData,
            ...data,
        }));

        if (data.result) {
            toast('The game has ended.')
        }
    }

    const fetchGameData = async (gameCode: string) => {
        try {
            const response = await api.get(`/${gameCode}/info/`);

            if (response.status !== 200) {
                toast.error("Failed to fetch game info");
                return;
            }

            const data: GameContextData = response.data;
            console.log('received', data);
            updateGameContext(data);
        } catch (error) {
            console.error('Error fetching game data:', error);
            toast.error("Failed to fetch game info");
        }
    };

    return (
        <GameContext.Provider value={{  game: contextData,
                                        updateGameContext,
                                        fetchGameData }}>
            {children}
        </GameContext.Provider>
    );
};
