import React, { useContext, useEffect } from "react";
import GameContext, {GameContextData, Player, PlayerRole} from "@/context/GameContext";
import chessboard from '@/public/chessboard.png';
import Image from 'next/image';
import getWebSocket from "@/services/socket";
import authContext from "@/context/AuthContext";
import PlayerHeaderButton from "@/components/lobby/PlayerHeaderButton";
import SpectatorList from "@/components/lobby/SpectatorList";
import MoveToSpectatorsButton from "@/components/lobby/MoveToSpectatorsButton";
import StartGameButton from "@/components/lobby/StartGameButton";
import SERVER_URL from "@/config";
import { router } from "next/client";
import SubLobby from "@/components/lobby/SubLobby";
import {bold} from "next/dist/lib/picocolors";
import assert from "assert";

interface LobbyProps {
    gameData: GameContextData;
    rerenderParent: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameData, rerenderParent }) => {
    const { gameContextData, updateGameContext, fetchGameData } = useContext(GameContext);
    const { user, authTokens } = useContext(authContext);
    const socket: WebSocket | null = getWebSocket(gameData.gameCode);

    useEffect(() => {
        updateGameContext(gameData);

        if (socket) {
            socket.onopen = () => {
                socket.send(JSON.stringify({ type: 'connect' }));
            }

            socket.onmessage = (event) => {
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

        // return () => {
        //     if (socket?.readyState === 1)
        //         socket?.close();
        // };

    }, [socket]);

    if (!gameContextData) {
        return (<h3>Loading...</h3>);
    }

    const { gameCode, spectators, host } = gameContextData;
    const fromSide = user?.user_id;

    const findPlayerBoardNRole = (userId: number): {board: number, playerRole: PlayerRole} => {

        for (const boardId in gameContextData.boards) {
            const board = gameContextData.boards[boardId];
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
        if (gameContextData.spectators) {
            for (const spectator of gameContextData.spectators) {
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

    const sendWSLobbyEvent = (toSide: string, toSubgame: number = 1) => {
        if (socket && user) {
            const { board, playerRole } = findPlayerBoardNRole(user.user_id)
            socket.send(JSON.stringify({
                type: 'lobbySwitch',
                fromSubgame: board, // remember that this one can be null
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
            {gameContextData ? (
                <>
                    <h1>This is a lobby page. Lobby ID: {gameCode}</h1>
                    <div className="flex flex-row md:flex-row justify-center items-center gap-10">

                        {Object.keys(gameContextData.boards).map((subgameId) => {
                            // @ts-ignore
                            const board = gameContextData.boards[subgameId]
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
                        })
}
                        <SpectatorList spectators={spectators} />
                        <MoveToSpectatorsButton wsSendCallback={sendWSLobbyEvent} />
                        {host.id === user?.user_id
                            ? <StartGameButton
                                startGame={startGame}
                                isDisabled={
                                    !Object.values(gameContextData.boards).every(
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
