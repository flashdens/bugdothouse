import React, { useCallback, useState, useEffect } from 'react';
import { Chessboard } from "react-chessboard";
import SERVER_URL from "@/config";
import socket from "@/services/socket"

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
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

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
                setGameState(prevState => ({
                    fen: data.fen,
                    sideToMove: data.sideToMove
                }));
            });

            // socket.onmessage = function (e) {
            //     console.log(e)
            //     const data = JSON.parse(e.data).move;
            //     console.log("Received message:", data);
            //
            //     setGameState(() => ({
            //         fen: data.fen,
            //         sideToMove: data.sideToMove
            //     }));
            //
            //     const feedbackElement = document.getElementById("feedback");
            //     if (feedbackElement) {
            //         feedbackElement.innerText = data.message;
            //     }
            // }


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
            if (!socket)
                return false;
            else {
                socket.send(JSON.stringify(moveData));
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
                    />
                </div>
            )}
            <h2 id={"feedback"}></h2>
            {/*<h2>{gameState.sideToMove ? 'WHITE' : 'BLACK'}</h2>*/}

        </div>
    );
}

export default TestChessboard;
