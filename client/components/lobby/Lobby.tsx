import React, { useContext, useEffect } from "react";
import GameContext, {GameContextData, GameMode, Player, PlayerRole} from "@/context/GameContext";
import chessboard from '@/public/chessboard.png';
import Image from 'next/image';
import getWebSocket from "@/services/socket";
import authContext from "@/context/AuthContext";
import PlayerHeaderButton from "@/components/lobby/PlayerHeaderButton";
import SpectatorList from "@/components/lobby/SpectatorList";
import MoveToSpectatorsButton from "@/components/lobby/MoveToSpectatorsButton";
import StartGameButton from "@/components/lobby/StartGameButton";
import SERVER_URL from "@/config";
import { useRouter } from "next/router";
import SubLobby from "@/components/lobby/SubLobby";
import {bold} from "next/dist/lib/picocolors";
import assert from "assert";

import copyIcon from '@/public/copyIcon.svg'

interface LobbyProps {
    gameData: GameContextData;
    rerenderParent: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameData, rerenderParent }) => {
    const { game, updateGameContext, fetchGameData } = useContext(GameContext);
    const { user, authTokens } = useContext(authContext);
    const router = useRouter();

    const socket: WebSocket | null = getWebSocket(gameData.gameCode);

    const findPlayerBoardNRole = (userId: number, game: any): undefined | {board: number, playerRole: PlayerRole} => {
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
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!socket || !user) return;
            const boardRoleData = findPlayerBoardNRole(user?.user_id, game);
            if (!boardRoleData) {
                console.log('really bad');
                return;
            }
            const {board, playerRole} = boardRoleData;
            socket.send(JSON.stringify({
                type: 'disconnect',
                subgameId: board,
                playerRole: playerRole,
                token: authTokens.access
            }));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        if (socket) {
            socket.onopen = () => {
                socket.send(JSON.stringify({ type: 'connect' }));
            }

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data);
                if (data.type === 'lobbySwitch' || data.type === 'connect') {
                    fetchGameData(gameData.gameCode);
                    console.log('dupa')
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


    if (!game || !user) return(<h3>Loading...</h3>);
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
        router.push('/');
    }

    const sendWSLobbyEvent = (toSide: string, toSubgame: number = 1) => {
        if (socket && user) {
            const { board, playerRole } = findPlayerBoardNRole(user.user_id, game)
            console.log(board, playerRole);
            socket.send(JSON.stringify({
                type: 'lobbySwitch',
                fromSubgame: board,
                fromSide: playerRole,
                toSubgame: toSubgame,
                toSide: PlayerRole[toSide as keyof typeof PlayerRole],
                token: authTokens.access,
            }));
        }
    };
    
   const sendWSAIAddEvent = (toSide: string, toSubgame: number = 1, msgType: 'aiAdd' | 'aiRemove') => {
        if (socket && user) {
            socket.send(JSON.stringify({
                type: 'lobbyAI',
                event: msgType,
                toSubgame: toSubgame,
                toSide: PlayerRole[toSide as keyof typeof PlayerRole],
                token: authTokens.access,
            }));
        }
    };

    const startGame = () => {
        fetch(`${SERVER_URL}/api/${gameCode}/start/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
            },
        })
            .then(response => {
                if (!response.ok)
                    throw new Error('upsi');
                else {
                    // response ok -> game started
                    socket?.send(JSON.stringify({ 'type': 'gameStart' }));
                    return response.json();
                }
            })
    }

    return (
        <>
            {game ? (
                <>
                    <div className="flex flex-col justify-center items-center gap-2 border w-fit mx-auto p-5 mt-20">
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
                            <Image className={'w-auto h-5 align-middle inline-block'} src={copyIcon} alt={'Copy to clipboard'}/>
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
                            <MoveToSpectatorsButton wsSendCallback={sendWSLobbyEvent} />
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
