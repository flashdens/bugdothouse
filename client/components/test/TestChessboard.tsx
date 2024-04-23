import React, { useCallback, useState, useEffect } from 'react';
import { Chessboard } from "react-chessboard";
import SERVER_URL from "@/config";

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

const TestChessboard = () => {
    const [moveSocket, setMoveSocket] = useState<WebSocket | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        fen: START_FEN,
        sideToMove: WHITE
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const socket = new WebSocket('ws://localhost/ws/test/');
            setMoveSocket(socket);

            socket.onmessage = function (e) {
                const data = JSON.parse(e.data).move;
                console.log("Received message:", data);

                setGameState(prevState => ({
                    fen: data.fen,
                    sideToMove: !prevState.sideToMove
                }));

                const feedbackElement = document.getElementById("feedback");
                if (feedbackElement) {
                    feedbackElement.innerText = data.message;
                }
            };

            socket.onclose = function (e) {
                console.error("Socket closed unexpectedly");
            };
        }

        fetch(`${SERVER_URL}/api/test/game_info/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                setGameState(prevState => ({
                    fen: data.fen,
                    sideToMove: !prevState.sideToMove
                }));
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
                setGameState({
                    ...data,
                    fen: data.fen,
                    sideToMove: !gameState.sideToMove
                })
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const makeMove = useCallback(
        (moveData: MoveData) => {
            if (!moveSocket)
                return false;

            moveSocket.send(JSON.stringify(moveData));

            return true;
        }, [moveSocket]);

    const onDrop = (from: string, to: string): boolean => {
        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
        };

        const move: any = makeMove(moveData);

        return !!move;
    }

    return (
        <div>
            <button onClick={startNewGame}>Start New Game</button>
            {gameState && (
                <div style={{width: '80dvh'}}>
                    <Chessboard
                        position={gameState.fen}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                    />
                </div>
            )}
            <h2 id={"feedback"}></h2>
            <h2>{gameState.sideToMove ? 'WHITE' : 'BLACK'}</h2>

        </div>
    );
}

export default TestChessboard;
