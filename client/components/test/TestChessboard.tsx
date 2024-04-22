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
    sideToMove: boolean;
}

const TestChessboard = () => {
    const [moveSocket, setMoveSocket] = useState<WebSocket | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        fen: START_FEN,
        sideToMove: WHITE
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const socket = new WebSocket('ws://localhost/ws' );
            setMoveSocket(socket);

            socket.onmessage = function (e) {
                const data = JSON.parse(e.data);
                console.log(data, "got message");
            }

            socket.onclose = function (e) {
                console.error("socket closed unexpectedly");
            }
        }
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
                    sideToMove: !data.sideToMove
                })
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const makeMove = useCallback(
        (moveData: MoveData) => {
            if (!moveSocket) return false;

            fetch(`${SERVER_URL}/api/test/move/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(moveData),
            })
                .then(response => response.json())
                .then(data => {
                    setGameState({
                        ...data,
                        fen: data.fen
                    })
                    moveSocket.send(JSON.stringify(moveData));
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            return false;
        }, [moveSocket]);

    const onDrop = (from: string, to: string): boolean => {
        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
            sideToMove: false,
        };

        const move: any = makeMove(moveData);

        return !!move;
    }

    return (
        <div>
            <h1>dupa</h1>
            <button onClick={startNewGame}>Start New Game</button>
            {gameState && (
                <div style={{ width: '80dvh' }}>
                    <Chessboard
                        position={gameState.fen}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                    />
                </div>
            )}
        </div>
    );
}

export default TestChessboard;
