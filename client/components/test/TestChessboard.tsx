import React, { useCallback, useState, useEffect } from 'react';
import { Chessboard } from "react-chessboard";
import SERVER_URL from "@/config";
import {getWebSocket} from "@/services/socket"
import {WebSocket} from "undici-types";
import game from "@/pages/game";
import {BoardOrientation} from "react-chessboard/dist/chessboard/types";

const START_FEN: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
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

interface TestChessboardProps {
    side: 'WHITE' | 'BLACK';
}

const TestChessboard: React.FC<TestChessboardProps> = ( {side} ) => {
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(side.toLowerCase() as BoardOrientation);
    let socket = getWebSocket();
    console.log(side)




    const handleReverseBoard = () => {
        setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
    };

    useEffect(() => {
        fetch(`${SERVER_URL}/api/test/game_info/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setGameState({
                    fen: data.fen,
                    sideToMove: data.sideToMove
                });

                if (!socket) return;

                socket.onmessage = (e) => {
                    const data = JSON.parse(e.data).message
                    if (data.type === 'move') {
                        setGameState(() => ({
                        fen: data.fen,
                        sideToMove: data.sideToMove
                        }));

                        const feedbackElement = document.getElementById("feedback");
                        if (feedbackElement && data.error) {
                            feedbackElement.innerText = data.error;
                        }
                    }
                }
            });
    }, []);


    const startNewGame = () => {
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

        const move: unknown = makeMove(moveData);

        return !!move;
    }

    return (
        <div>
            <button className={"bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"}
                    onClick={handleReverseBoard}>Reverse board</button>
            {gameState && (
                <div style={{width: '80dvh'}}>
                    <Chessboard
                        position={gameState.fen}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                        boardOrientation={boardOrientation}
                        isDraggablePiece={({ piece }) => piece[0] === (side === 'WHITE' ? 'w' : 'b')}
                    />
                </div>
            )}
            <h2>You're playing as {side}</h2>
            <h2>{"Side to move: " + (gameState?.sideToMove ? "WHITE" : "BLACK")}</h2>
            <h2 id={"feedback"}></h2>
            <h2 id={"gameOver"}></h2>

        </div>
    );
}

export default TestChessboard;
