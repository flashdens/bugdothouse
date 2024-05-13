import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Chessboard} from "react-chessboard";
import SERVER_URL from "@/config";
import {getWebSocket} from "@/services/socket"
import {BoardOrientation, Piece} from "react-chessboard/dist/chessboard/types";
import {toast} from 'react-toastify'
import game, {Player} from "@/pages/crazyhouse";
import GameContext from "@/context/GameContext";
import socket from "@/services/socket";
import {retry} from "next/dist/compiled/@next/font/dist/google/retry";

const WHITE: boolean = false;
const BLACK: boolean = true;

interface MoveData {
    fromSq?: string;
    toSq: string;
    sideToMove?: boolean;
    piece: string;
    promotion: 'n' | 'b' | 'r' | 'q' | '';
}

interface FetchGameInfoResponse {
    fen: string;
    sideToMove: boolean;
    whitePlayerName: string;
    blackPlayerName: string;
}

interface WSMoveResponse {
    error?: string;
    fen: string;
    gameOver?: string;
    sideToMove: boolean;
    type: 'move';
    whitePocket: {[key: string]: number};
    blackPocket: {[key: string]: number};
}

interface TestChessboardProps {
    player: Player;
}

const TestChessboard: React.FC<TestChessboardProps> = ( {player} ) => {
    // @ts-ignore
    const {contextData, updateGameContext} = useContext(GameContext);
    if (!contextData) return(<div>gowno</div>);
    const {fen, sideToMove} = contextData;

    let socket = getWebSocket();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {

                if (!socket) return;

                socket.onmessage = (e) => {
                    const data: WSMoveResponse = JSON.parse(e.data)
                    console.log(data);
                    if (data.type === 'move') {
                        updateGameContext({
                            fen: data.fen,
                            sideToMove: data.sideToMove,
                            whitePocket: data.whitePocket,
                            blackPocket: data.blackPocket,
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

    // eslint-disable-next-line react-hooks/rules-of-hooks
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


    const isPromotion = (sourceSquare: string, targetSquare: string, piece: Piece) => {
        if (!sourceSquare)
            return false;

        return (piece === "wP" && sourceSquare[1] === "7" && targetSquare[1] === "8") ||
            (piece === "bP" && sourceSquare[1] === "2" && targetSquare[1] === "1") &&
            (Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <= 1)
    }
    const onDrop = (from: string, to: string, piece: Piece): boolean => {
        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
            piece: piece.slice(1).toLowerCase(), // server only needs lower case piece type
            promotion: isPromotion(from, to, piece) ? "q" : ''
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
                <div style={{width: '70dvh'}}>
                    <Chessboard
                        position={contextData.fen}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={true}
                        boardOrientation={player.side.toLowerCase() as BoardOrientation}
                        isDraggablePiece={({ piece }) => piece[0] === (player.side === 'WHITE' ? 'w' : 'b')}
                        onPromotionCheck={isPromotion}
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
