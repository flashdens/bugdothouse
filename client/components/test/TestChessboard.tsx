import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {Chessboard} from "react-chessboard";
import SERVER_URL from "@/config";
import {getWebSocket} from "@/services/socket"
import {BoardOrientation, Piece} from "react-chessboard/dist/chessboard/types";
import {toast} from 'react-toastify'
import HTML5Backend from "@/services/CustomHTML5Backend";
import GameContext from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";

const WHITE: boolean = false;
const BLACK: boolean = true;

export type PlayerSide = 'WHITE' | 'BLACK' | 'SPECTATOR';

interface MoveData {
    fromSq?: string;
    toSq: string;
    sideToMove?: boolean;
    code: string;
    piece: string;
    promotion: 'n' | 'b' | 'r' | 'q' | '';
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
    cbId: string
    playerSide: PlayerSide;
}

const TestChessboard: React.FC<TestChessboardProps> = ( {cbId, playerSide} ) => {
    // @ts-ignore
    const {gameContextData, updateGameContext, updateBoardContext} = useContext(GameContext);
    const {user, authTokens} = useContext(AuthContext)
    if (!gameContextData)
        return(<div>waiting...</div>);
    const {gameCode} = gameContextData;
    const {fen,sideToMove, whitePlayer, blackPlayer} = gameContextData.boards[cbId]
    let socket = getWebSocket(gameCode);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (e) => {
            const data: WSMoveResponse = JSON.parse(e.data)
            console.log(data);
            if (data.type === 'move') {
                updateBoardContext(cbId, {
                            fen: data.fen,
                            sideToMove: data.sideToMove,
                            whitePocket: data.whitePocket,
                            blackPocket: data.blackPocket,
                        }
                );

                const gameOverElement = document.getElementById("gameOver");
                if (gameOverElement && data.gameOver) {
                    gameOverElement.innerText = data.gameOver as string;
                }
            }
            else if (data.type === 'error') {
                const feedbackElement = document.getElementById("feedback");
                if (feedbackElement && data.error) {
                    toast.error(data.error, {autoClose: 2000, hideProgressBar: true})
                }
            }
        }

       return () => {
            socket.close();
        };
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
                updateBoardContext(cbId, {
                        fen: data.fen,
                        sideToMove: data.sideToMove,
                        whitePocket: data.whitePocket,
                        blackPocket: data.blackPocket,
                    }
                );

            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const makeMove = (moveData: MoveData): boolean => {
        if (!socket) {
            console.log('where is my motherfucking socket');
            return false;
        }
        else {
            socket.send(JSON.stringify({
                type: 'move',
                token: authTokens.access,
                ...moveData
            }));
            return true;
        }
    };


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
            code: gameCode,
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
            {gameContextData && (
                <div style={{width: '70dvh'}}>
                    <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        customDndBackend={HTML5Backend}
                        boardOrientation={playerSide.toLowerCase() as BoardOrientation}
                        isDraggablePiece={({ piece }) => piece[0] === (playerSide === 'WHITE' ? 'w' : 'b')}
                        onPromotionCheck={isPromotion}
                    />
                </div>
            )}

            <h2>Hello {user?.username}</h2>
            <h2>{"Side to move: " + (sideToMove ? "WHITE" : "BLACK")}</h2>
            <h2>{playerSide ? "You're playing as " + playerSide : "You're spectating the game"}</h2>
            <h2 id={"feedback"}></h2>
            <h2 id={"gameOver"}></h2>
    </>
);
}

export default TestChessboard;
