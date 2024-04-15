import React, {useCallback, useState} from 'react';
import {Chessboard} from "react-chessboard";
import SERVER_URL from "@/config";

const START_FEN: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"


enum Sides {
    'WHITE',
    'BLACK',
}

interface GameState {
    fen: string
    sideToMove: Sides
}

interface MoveData {
    fromSq: string,
    toSq: string,
    sideToMove: number
}

const ChessGame = () => {
    const [gameState, setGameState] = useState<GameState>(
        {
        fen: START_FEN,
        sideToMove: Sides.WHITE
        });


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
                    fen: data.fen
                })
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };


    const makeMove = useCallback(
        (moveData: MoveData) => {
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
                return true;
        })
        .catch(error => {
            console.error('Error:', error);
        });

            return false;
        }, []);
    

    const onDrop = (from: string, to: string): boolean => {
        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
            sideToMove: 0,
        };

        const move: any = makeMove(moveData);


        return !!move;
    }

    return (
        <div>
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

export default ChessGame;
