import React, {useContext, useEffect} from 'react';
import {Chessboard} from "react-chessboard";
import {getWebSocket} from "@/services/socket"
import {BoardOrientation, Piece} from "react-chessboard/dist/chessboard/types";
import {toast} from 'react-toastify'
import HTML5Backend from "@/services/CustomHTML5Backend";
import GameContext, {GameResultStrings, GameStatus} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";

const WHITE: boolean = false;
const BLACK: boolean = true;

export type PlayerSide = 'WHITE' | 'BLACK' | 'SPECTATOR';

interface MoveData {
    fromSq?: string,
    toSq: string,
    promotion: ('n' | 'b' | 'r' | 'q') | null
}


interface WSMoveResponse {
    error?: string,
    fen: string,
    gameOver?: string,
    subgame: string,
    sideToMove: boolean,
    type: 'move',
    whitePocket: {[key: string]: number},
    blackPocket: {[key: string]: number},
}

interface TestChessboardProps {
    cbId: string,
    playerSide: PlayerSide
}

const GameChessboard: React.FC<TestChessboardProps> = ({cbId, playerSide} ) => {
    const {gameContextData, updateGameContext, updateBoardContext} = useContext(GameContext);
    const {user, authTokens} = useContext(AuthContext)
    if (!gameContextData)
        return(<div>waiting...</div>);
    const {gameCode} = gameContextData;
    const {fen,sideToMove, whitePlayer, blackPlayer} = gameContextData.boards[cbId]
    let socket = getWebSocket(gameCode);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!socket || !cbId) return;

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data.type === 'move') {
                updateGameContext(data);

                const gameOverElement = document.getElementById("gameOver");
                if (gameOverElement && data.gameOver) {
                    gameOverElement.innerText = GameResultStrings[data.gameOver];
                }
            }
            else if (data.type === 'error') {
                const feedbackElement = document.getElementById("feedback");
                if (feedbackElement && data.error) {
                    toast.error(data.error, {autoClose: 2000, hideProgressBar: true})
                }
            }
        }
    }, []);



    const makeMove = (moveData: MoveData): boolean => {
        if (!socket) {
            console.log('no sockets?');
            return false;
        }
        else {
            console.log(cbId);
            socket.send(JSON.stringify({
                type: 'move',
                token: authTokens.access,
                subgame: Number(cbId),
                code: gameCode,
                ...moveData
            }));
            return true;
        }
    };


    const isPromotion = (sourceSquare: string, targetSquare: string, piece: Piece) => {
        if (!sourceSquare)
            return false;

        return ((piece === "wP" && sourceSquare[1] === "7" && targetSquare[1] === "8") ||
            (piece === "bP" && sourceSquare[1] === "2" && targetSquare[1] === "1")) &&
            (Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <= 1)
    }

    const onDrop = (from: string, to: string, piece: Piece): boolean => {
        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
            promotion: piece[1].toLowerCase() as MoveData['promotion']
        };
        return makeMove(moveData);
    }

    return (
        <>
            {gameContextData && (
                <div style={{width: '65dvh'}}>
                    <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        customDndBackend={HTML5Backend}
                        // todo bad solution, not working for spectators only, implement reverse board for spectators only?
                        boardOrientation={playerSide !== "SPECTATOR"
                            ? playerSide.toLowerCase() as BoardOrientation
                            : 'black'}
                        isDraggablePiece={({ piece }) => {
                            return (gameContextData?.status === GameStatus.ONGOING)
                                && ((playerSide === "WHITE" && piece[0] === 'w')
                                || (playerSide === "BLACK" && piece[0] === 'b')
                                || (playerSide !== "SPECTATOR"));
                        }}
                        onPromotionCheck={isPromotion}
                    />
                </div>
            )}


    </>
);
}

export default GameChessboard;
