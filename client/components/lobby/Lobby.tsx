import React, { useContext, useEffect } from "react";
import GameContext, { GameContextData, GameMode, PlayerRole } from "@/context/GameContext";
import Image from 'next/image';
import getWebSocket from "@/services/socket";
import authContext from "@/context/AuthContext";
import SpectatorList from "@/components/lobby/SpectatorList";
import StartGameButton from "@/components/lobby/StartGameButton";
import SERVER_URL from "@/config";
import Router, { useRouter } from "next/router";
import SubLobby from "@/components/lobby/SubLobby";
import assert from "assert";
import copyIcon from '@/public/copyIcon.svg'
import api, { getAuthTokens, refreshToken } from "@/services/api";
import { toast } from "react-toastify";
import Head from "next/head";

/**
 * @interface LobbyProps
 * @brief Props komponentu Lobby.
 *
 * @property {GameContextData} gameData dane dotyczące gry, pobierane przed wyświetlaniem komponentu z serwera.
 * @property {function} rerenderParent funkcja, której wywołanie wymusza ponowne załadowanie rodzica komponentu.
 */
interface LobbyProps {
    gameData: GameContextData;
    rerenderParent: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameData, rerenderParent }) => {
    const { game, updateGameContext, fetchGameData } = useContext(GameContext);
    const { user, authTokens } = useContext(authContext);
    const router = useRouter();

    const socket: WebSocket | null = getWebSocket(gameData.gameCode);

    const findPlayerBoardNRole = (userId: number, game: any): { board: number, playerRole: PlayerRole } => {
        for (const boardId in game.boards) {
            const board = game.boards[boardId];
            if (board.whitePlayer && board.whitePlayer.id == userId) {
                return ({
                    board: Number(boardId),
                    playerRole: PlayerRole.whitePlayer
                })
            }
            else if (board.blackPlayer && board.blackPlayer.id == userId) {
                return ({
                    board: Number(boardId),
                    playerRole: PlayerRole.blackPlayer
                })
            }
        }

        // finally search spectators
        if (game.spectators) {
            for (const spectator of game.spectators) {
                if (spectator.id == userId) {
                    return ({
                        board: 1, // spectators are shared, so w/e
                        playerRole: PlayerRole.spectator
                    })
                }
            }
        }

        // if it reaches this far, something has gone terribly wrong
        assert(false);
    }

    useEffect(() => {
        updateGameContext(gameData);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!socket || !user) return;
            const boardRoleData = findPlayerBoardNRole(user?.user_id, game);
            if (!boardRoleData) {
                return;
            }
            const { board, playerRole } = boardRoleData;
            refreshToken();
            socket.send(JSON.stringify({
                type: 'disconnect',
                subgameId: board,
                playerRole: playerRole,
                token: authTokens!.access
            }));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        if (socket) {
            socket.onopen = () => {
                socket.send(JSON.stringify({ type: 'connect' }));
            }

            socket.onmessage = (event) => {
                refreshToken();
                const data = JSON.parse(event.data);
                console.log(data);
                if (data.type === 'lobbySwitch' || data.type === 'connect') {
                    fetchGameData(gameData.gameCode);
                } else if (data.type == 'gameStart') {
                    fetchGameData(gameData.gameCode);
                    rerenderParent();
                }
            }
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };

    }, [socket, game?.spectators]);


    if (!game || !user) return (<h3>Loading...</h3>);
    const { gameCode, spectators, host } = game;

    const gameLink = SERVER_URL + ':3001/' + game.gameCode;

    const copyLinkToClipboard = (event: any) => {
        void navigator.clipboard.writeText(gameLink);

        const element = event.currentTarget;
        if (!element) return;

        element.classList.add('bg-green-500', 'transition-colors', 'duration-500', 'ease-in-out');

        setTimeout(() => {
            element.classList.remove('bg-green-500');
        }, 1000);
    }

    const backToLobby = () => {
        void router.push('/');
    }

    const sendWSLobbyEvent = async (toSide: string, toSubgame: number = 1) => {
        await refreshToken();
        const accessToken = getAuthTokens().access;

        if (socket && user) {
            const { board, playerRole } = findPlayerBoardNRole(user.user_id, game)

            socket.send(JSON.stringify({
                type: 'lobbySwitch',
                fromSubgame: board,
                fromSide: playerRole,
                toSubgame: toSubgame,
                toSide: PlayerRole[toSide as keyof typeof PlayerRole],
                token: accessToken,
            }));
        }
    };

    const sendWSAIAddEvent = async (toSide: string, toSubgame: number = 1, msgType: 'aiAdd' | 'aiRemove') => {
        await refreshToken();
        const accessToken = getAuthTokens().access;

        if (socket && user) {
            socket.send(JSON.stringify({
                type: 'lobbyAI',
                event: msgType,
                toSubgame: toSubgame,
                toSide: PlayerRole[toSide as keyof typeof PlayerRole],
                token: accessToken
            }));
        }
    };

    const startGame = async () => {
        try {
            await refreshToken();
            const response = await api.post(`${gameCode}/start/`, {}, {});

            if (response.status !== 200) {
                toast.error('Failed to start the game');
            } else {
                // Response ok -> game started
                socket?.send(JSON.stringify({ 'type': 'gameStart' }));
                Router.reload();
                return response.data;
            }
        } catch (error) {
            console.error('Error starting the game:', error);
            throw new Error('Failed to start the game');
        }
    };

    return (
        <>
            <Head>
                <title>Lobby | bug.house</title>
            </Head>
            {game ? (
                <>
                    <div className="flex flex-col justify-center mt-12 items-center gap-2 border bg-white rounded-lg px-12 shadow-2xl w-fit mx-auto p-5 h-auto lg:h-max">
                        <button
                            className={'self-start bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded'}
                            onClick={backToLobby}
                        >
                            ⬅️ Back to homepage
                        </button>

                        <h1 className={'text-4xl'}>Game lobby</h1>
                        <span>{GameMode[game.gameMode]}</span>
                        <div className={'inline-block cursor-pointer hover:bg-gray-100 p-1 rounded'}
                             onClick={copyLinkToClipboard}>
                            <h3 className={'mx-2 inline-block'}>{gameLink}</h3>
                            <Image className={'w-auto h-5 align-middle inline-block'} src={copyIcon} alt={'Copy to clipboard'} />
                        </div>
                        <div className={'flex flex-col lg:flex-row gap-5'}>
                            {Object.keys(game.boards).map((subgameId) => {
                                const board = game.boards[subgameId]
                                return (
                                    <SubLobby
                                        key={subgameId}
                                        whitePlayer={board.whitePlayer}
                                        blackPlayer={board.blackPlayer}
                                        sendWSLobbyEvent={sendWSLobbyEvent}
                                        sendWSAIEvent={sendWSAIAddEvent}
                                        subgameId={Number(subgameId)}
                                    />
                                );
                            })}
                        </div>
                        <SpectatorList spectators={spectators} hostId={game.host.id} />
                        {host.id === user?.user_id
                            ? <StartGameButton
                                startGame={startGame}
                                isDisabled={
                                    !Object.values(game.boards).every(
                                        board =>
                                            board.whitePlayer !== null && board.blackPlayer !== null
                                    )
                                }
                            />
                            : <p>Waiting for start...</p>
                        }
                    </div>
                </>
            ) : (
                <h3>Loading...</h3>
            )}
        </>
    );

};

export default Lobby;
