import React, {useCallback, useEffect, useState} from 'react';
import {Chessboard} from "react-chessboard";
import SERVER_URL from "@/config";
import {getWebSocket} from "@/services/socket"
import {BoardOrientation} from "react-chessboard/dist/chessboard/types";

const WHITE: boolean = false;
const BLACK: boolean = true;

interface GameState {
    fen: string;
    sideToMove: boolean;
}

interface MoveData {
    fromSq: string;
    toSq: string;
    sideToMove?: boolean;
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
    side: 'WHITE' | 'BLACK';
}

const TestChessboard: React.FC<TestChessboardProps> = ( {side} ) => {
    const [gameState, setGameState] = useState<GameState | null>(null)
    let socket = getWebSocket();

    useEffect(() => {
        fetch(`${SERVER_URL}/api/test/game_info/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then((data: FetchGameInfoResponse) => {

                setGameState({
                    fen: data.fen,
                    sideToMove: data.sideToMove
                });

                if (!socket) return;

                socket.onmessage = (e) => {
                    const data: WSMoveResponse = JSON.parse(e.data).message
                    console.log(data);
                    if (data.type === 'move') {
                        setGameState(() => ({
                        fen: data.fen,
                        sideToMove: data.sideToMove
                        }));

                        const feedbackElement = document.getElementById("feedback");
                        if (feedbackElement && data.error) {
                            feedbackElement.innerText = data.error;
                        }

                        const gameOverElement = document.getElementById("gameOver");
                        if (gameOverElement && data.gameOver) {
                            gameOverElement.innerText = data.gameOver as string;
                        }
                    }
                }
            });
    }, []);

    const resetGame = () => {
        fetch(`${SERVER_URL}/api/test/new_game/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (gameState) {
                    setGameState({
                        ...data,
                        fen: data.fen,
                        sideToMove: WHITE
                    })
                }
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

    const onDrop = (from: string, to: string): boolean => {
        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
        };

        return makeMove(moveData);
    }

    return (
        <div>
           <button
               onClick={resetGame} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
               reset game
           </button>
            {gameState && (
                <div style={{width: '80dvh'}}>
                    <Chessboard
                        position={gameState.fen}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                        boardOrientation={side.toLowerCase() as BoardOrientation}
                        isDraggablePiece={({ piece }) => piece[0] === (side === 'WHITE' ? 'w' : 'b')}
                    />
                </div>
            )}

            {/*<h2>You're playing as {side}</h2>*/}
            <h2>{"Side to move: " + (gameState?.sideToMove ? "WHITE" : "BLACK")}</h2>
            <h2 id={"feedback"}></h2>
            <h2 id={"gameOver"}></h2>

        </div>
    );
}

export default TestChessboard;
