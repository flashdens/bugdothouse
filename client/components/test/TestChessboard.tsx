import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Chessboard} from "react-chessboard";
import SERVER_URL from "@/config";
import {getWebSocket} from "@/services/socket"
import {BoardOrientation, Piece} from "react-chessboard/dist/chessboard/types";
import {toast} from 'react-toastify'
import game, {Player} from "@/pages/game";
import GameContext from "@/context/GameContext";
import socket from "@/services/socket";

const WHITE: boolean = false;
const BLACK: boolean = true;

interface MoveData {
    fromSq?: string;
    toSq: string;
    sideToMove?: boolean;
    piece: string
    uuid: string
}

interface FetchGameInfoResponse {
    fen: string,
    sideToMove: boolean,
    whitePlayerName: string,
    blackPlayerName: string
}

interface WSMoveResponse {
    error?: string,
    fen: string,
    gameOver?: string,
    sideToMove: boolean,
    type: 'move'
}

interface TestChessboardProps {
    player: Player
}

const TestChessboard: React.FC<TestChessboardProps> = ( {player} ) => {
    // @ts-ignore
    const {contextData, updateGameContext} = useContext(GameContext);
    if (!contextData) return(<div>gowno</div>);
    const {fen, sideToMove} = contextData;

    let socket = getWebSocket();

    useEffect(() => {

                if (!socket) return;

                socket.onmessage = (e) => {
                    const data: WSMoveResponse = JSON.parse(e.data)
                    console.log(data);
                    if (data.type === 'move') {
                        updateGameContext({
                            fen: data.fen,
                            sideToMove: data.sideToMove
                        });

                        const gameOverElement = document.getElementById("gameOver");
                        if (gameOverElement && data.gameOver) {
                            gameOverElement.innerText = data.gameOver as string;
                        }

                        console.log(fen);
                    }
                    else if (data.type === 'error') {
                        const feedbackElement = document.getElementById("feedback");
                        if (feedbackElement && data.error) {
                            toast.error(data.error, {autoClose: 2000, hideProgressBar: true})
                        }

                    }
                }
            });

    const resetGame = () => {
        fetch(`${SERVER_URL}/api/test/new_game/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                    updateGameContext({
                        fen: data.fen,
                        sideToMove: WHITE
                    })
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const makeMove = useCallback(
        (moveData: MoveData) => {
            if (!socket)
                return false;
            else {
                socket.send(JSON.stringify({
                    type: 'move',
                    ...moveData
                }));
                return true;
            }

        }, [socket]);

    const onDrop = (from: string, to: string, piece: Piece): boolean => {
        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
            piece: piece.slice(1).toLowerCase(), // server only needs lower case piece type
            uuid: player.uuid
        };
        return makeMove(moveData);
    }

    return (
        <>
           <button
               onClick={resetGame} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
               reset game
           </button>
            {contextData && (
                <div style={{width: '80dvh'}}>
                    <Chessboard
                        position={contextData.fen}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                        boardOrientation={player.side.toLowerCase() as BoardOrientation}
                        isDraggablePiece={({ piece }) => piece[0] === (player.side === 'WHITE' ? 'w' : 'b')}
                    />
                </div>
            )}

            <h2>Hello {player.username}</h2>
            <h2>{"Side to move: " + (contextData?.sideToMove ? "WHITE" : "BLACK")}</h2>
            <h2 id={"feedback"}></h2>
            <h2 id={"gameOver"}></h2>
    </>
);
}

export default TestChessboard;
