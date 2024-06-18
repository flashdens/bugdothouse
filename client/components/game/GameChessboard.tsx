import React, {useContext, useEffect, useState} from 'react';
import {Chessboard} from "react-chessboard";
import {getWebSocket} from "@/services/socket"
import {BoardOrientation, Piece} from "react-chessboard/dist/chessboard/types";
import {toast} from 'react-toastify'
import HTML5Backend from "@/services/CustomHTML5Backend";
import GameContext, {GameResultStrings, GameStatus} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";

import {BLACK, Chess, PieceSymbol, Square, WHITE} from "chess.js";

/**
 * @type PlayerSide {('WHITE' | 'BLACK' | 'SPECTATOR')}
 * @brief Typ reprezentujący stronę gracza w grze.
 */
export type PlayerSide = 'WHITE' | 'BLACK' | 'SPECTATOR';

/**
 * @interface MoveData
 * @brief Interfejs wiadomości o ruchu wysyłanej do serwera.
 *
 * @property {string} [fromSq] - pole, z którego został wykonany ruch (puste w przypadku).
 * @property {string} toSq - pole będące celem ruchu.
 * @property {string} droppedPiece - bierka, którą został wykonany ruch lub upuszczana bierka.
 * @property {('n' | 'b' | 'r' | 'q') | null} promotion - bierka promowana.
 */
interface MoveData {
    fromSq?: string;
    toSq: string;
    droppedPiece: string;
    promotion: ('n' | 'b' | 'r' | 'q') | null;
}

/**
 * @interface GameChessboardProps
 * @brief props komponentu GameChessboard.
 *
 * @property {string} cbId numer szachownicy (dotyczy kloca)
 * @property {playerSide} strona, którą zajmuje gracz
 */
interface GameChessboardProps {
    cbId: string,
    playerSide: PlayerSide
}

const GameChessboard: React.FC<GameChessboardProps> = ({cbId, playerSide} ) => {
    const {game, updateGameContext} = useContext(GameContext);
    const {user, authTokens} = useContext(AuthContext)
    const {fen,sideToMove, whitePlayer, blackPlayer} = game.boards[cbId];
    const [localFen, setLocalFen] = useState(fen);

    if (!game)
        return(<div>waiting...</div>);
    const {gameCode} = game;
    let socket = getWebSocket(gameCode);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!socket || !cbId) return;

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data.type === 'move') {
                updateGameContext(data);
                setLocalFen(data.boards[cbId].fen);

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

    /**
     * @brief Sprawdza, czy ruch jest promocją pionka.
     *
     * @param {string} sourceSquare - Pole, z którego został wykonany ruch.
     * @param {string} targetSquare - Pole będące celem ruchu.
     * @param {Piece} piece - Bierka, która została przesunięta.
     * @returns {boolean} - Zwraca true, jeśli ruch jest promocją pionka, false w przeciwnym razie.
     */
    const isPromotion = (sourceSquare: string, targetSquare: string, piece: Piece): boolean => {
            if (!sourceSquare)
                return false;

            return ((piece === "wP" && sourceSquare[1] === "7" && targetSquare[1] === "8") ||
                (piece === "bP" && sourceSquare[1] === "2" && targetSquare[1] === "1")) &&
                (Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <= 1)
    }

    const isUpperCase = (string: string) => /^[A-Z]*$/.test(string)


    const makeMove = async (moveData: MoveData) => {
    if (!socket) {
        console.log('no sockets?');
        return false;
    }

    const game = new Chess(fen);

    // handle drop
    if (moveData.fromSq === undefined) {
        const {toSq, fromSq, droppedPiece} = moveData;
        // .put() does not allow to drop on last ranks, so no need to check that
        if (!game.put({
            type: droppedPiece as PieceSymbol,
            color: isUpperCase(droppedPiece) ? BLACK : WHITE
            }, toSq as Square)) {
                return false;
        }
    }
    // handle move from board
    else {
        try {
            const move = game.move(moveData.fromSq + moveData.toSq);
            if (move === null) {
                return false;
            }
        }
        catch (e) {
            // invalid move errors don't require any handling, just let them pass
        }
    }

    // let socket.send() complete asynchronously
    setTimeout(() => {
        try {
            socket.send(JSON.stringify({
                type: 'move',
                token: authTokens.access,
                subgame: Number(cbId),
                code: gameCode,
                ...moveData
            }));
        } catch (error) {
            console.error('Socket send error:', error);
        }
    }, 0);

    setLocalFen(game.fen())

    return true;
};

    /**
     * @brief Funkcja wywoływana w momencie upuszczenia bierki na planszy.
     *
     * @param {string} from - pole, z którego został wykonany ruch.
     * @param {string} to - pole będące celem ruchu.
     * @param {Piece} piece - bierka, która została przesunięta.
     * @returns {boolean} - zraca true, jeśli ruch został pomyślnie przetworzony, w przeciwnym razie false.
     */
    const onDrop = (from: string, to: string, piece: Piece): boolean  => {
        console.log(piece)
        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
            droppedPiece: piece[1].toLowerCase(),
            promotion: piece[1].toLowerCase() as MoveData['promotion']
        };

        return makeMove(moveData);
    }

    return (
        <>
            {game && (
                <div className={'w-60dvh lg:w-70dvh'}>
                    <Chessboard
                        position={localFen}
                        onPieceDrop={onDrop}
                        customDndBackend={HTML5Backend}
                        // todo bad solution, not working for spectators only, implement reverse board for spectators only?
                        boardOrientation={playerSide !== "SPECTATOR"
                            ? playerSide.toLowerCase() as BoardOrientation
                            : 'black'}
                        isDraggablePiece={({ piece }) => {
                            return (game?.status === GameStatus.ONGOING)
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
