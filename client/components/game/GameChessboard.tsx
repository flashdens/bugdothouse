import React, { useContext, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { getWebSocket } from '@/services/socket';
import { BoardOrientation, Piece } from 'react-chessboard/dist/chessboard/types';
import { toast } from 'react-toastify';
import HTML5Backend from '@/services/CustomHTML5Backend';
import GameContext, { GameResultStrings, GameStatus } from '@/context/GameContext';
import AuthContext from '@/context/AuthContext';
import api, { getAuthTokens, refreshToken } from '@/services/api';
import { BLACK, Chess, Color, PieceSymbol, Square, WHITE } from 'chess.js';
import { jwtDecode } from 'jwt-decode';
import game from '@/components/game/Game';
import assert from 'assert';

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
    cbId: string;
    playerSide: PlayerSide;
}

const GameChessboard: React.FC<GameChessboardProps> = ({ cbId, playerSide }) => {
    const { game, updateGameContext } = useContext(GameContext);
    const { fen } = game!.boards[cbId];
    const [localFen, setLocalFen] = useState(fen);
    const [attackedKingSquare, setAttackedKingSquare] = useState<string | null>(null);
    const [lastMoveFromSquare, setLastMoveFromSquare] = useState<Square|null>(null);
    const [lastMoveToSquare, setLastMoveToSquare] = useState<Square|null>(null);

    const { gameCode } = game!;
    let socket = getWebSocket(gameCode);
    useEffect(() => {
        const attackedSquare = getAttackedKingSquare(fen);
        setAttackedKingSquare(attackedSquare!);
        console.log(game?.boards[cbId].lastMoveFromSquare)
        setLastMoveFromSquare(game?.boards[cbId].lastMoveFromSquare as Square);
        setLastMoveToSquare(game?.boards[cbId].lastMoveToSquare as Square);

        if (!socket || !cbId) return;

        const handleWsMessage = (e: any) => {
            const data = JSON.parse(e.data);
            if (data.type === 'move') {
                updateGameContext(data);
                setLocalFen(data.boards[cbId].fen);
                console.log(data);

                setLastMoveFromSquare(data.boards[cbId].lastMoveFromSquare as Square)
                setLastMoveToSquare(data.boards[cbId].lastMoveToSquare as Square);

                if (!game?.result) {
                    const attackedSquare = getAttackedKingSquare(data.boards[cbId].fen);
                    setAttackedKingSquare(attackedSquare!);
                }
            }

        };

        if (socket) {
            socket.addEventListener('message', handleWsMessage);
        }

        return () => {
            if (socket) {
                socket.removeEventListener('message', handleWsMessage);
            }
        };
    }, []);

    const getAttackedKingSquare = (localFen: string) => {
        const getKingSquareOfSide = (game: any, piece: { type: 'k'; color: Color }) => {
            return []
                .concat(...game.board())
                .map((p: { type: 'k'; color: Color }, index: number) => {
                    if (p !== null && p.type === piece.type && p.color === piece.color) {
                        return index;
                    }
                })
                .filter(Number.isInteger)
                .map((piece_index) => {
                    const row = 'abcdefgh'[piece_index! % 8];
                    const column = Math.ceil((64 - piece_index!) / 8);
                    return row + column;
                })[0];
        };

        const isSquareAttacked = (game: Chess, square: string, color: 'w' | 'b'): boolean => {
            return game.isAttacked(square as Square, color);
        };

        const localGame = new Chess(localFen);
        const kingSquare = getKingSquareOfSide(localGame, { type: 'k', color: localGame.turn()[0] as Color });
        const attackedColor = localGame.turn() === BLACK ? WHITE : BLACK;
        if (isSquareAttacked(localGame, kingSquare!, attackedColor)) return kingSquare;
    };

    /**
     * @brief Sprawdza, czy ruch jest promocją pionka.
     *
     * @param {string} sourceSquare - Pole, z którego został wykonany ruch.
     * @param {string} targetSquare - Pole będące celem ruchu.
     * @param {Piece} piece - Bierka, która została przesunięta.
     * @returns {boolean} - Zwraca true, jeśli ruch jest promocją pionka, false w przeciwnym razie.
     */
    const isPromotion = (sourceSquare: string, targetSquare: string, piece: Piece): boolean => {
        if (!sourceSquare) return false;

        return (
            ((piece === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8') ||
                (piece === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1')) &&
            Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <= 1
        );
    };

    const makeMove = async (moveData: MoveData): Promise<boolean> => {
        if (!socket) {
            toast.error('socket error!');
            return false;
        }

        const game = new Chess(fen);

        if (moveData.fromSq === undefined) {
            const { toSq, droppedPiece } = moveData;
            if (
                game.get(toSq as Square)
                || !game.put(
                    {
                        type: droppedPiece as PieceSymbol,
                        color: game.turn() === 'w' ? WHITE : BLACK,
                    },
                    toSq as Square
                )
            ) {
                console.log(game.get(toSq as Square))
                return false;
            }
        } else {
            try {
                const move = game.move(moveData.fromSq + moveData.toSq);
                if (move === null) {
                    return false;
                }
            } catch (e) {}
        }

        setLastMoveFromSquare(moveData.fromSq as Square)
        setLastMoveToSquare(moveData.toSq as Square)
        const attackedSquare = getAttackedKingSquare(game.fen());
        setAttackedKingSquare(attackedSquare!);

        try {
            await refreshToken();

            socket.send(
                JSON.stringify({
                    type: 'move',
                    token: getAuthTokens().access,
                    subgame: Number(cbId),
                    code: gameCode,
                    ...moveData,
                })
            );
        } catch (error) {
            console.error('Socket send error:', error);
        }

        setLocalFen(game.fen());
        return true;
    };

    /**
     * @brief Funkcja wywoływana w momencie upuszczenia bierki na planszy.
     *
     * @param {string} from - pole, z którego został wykonany ruch.
     * @param {string} to - pole będące celem ruchu.
     * @param {Piece} piece - bierka, która została przesunięta.
     * @returns {boolean} - zwraca true, jeśli ruch został pomyślnie przetworzony, w przeciwnym razie false.
     */
    const onDrop = (from: string, to: string, piece: Piece): Promise<boolean> | boolean => {
        if (
            (playerSide === 'BLACK' && game?.boards[cbId].sideToMove) ||
            (playerSide === 'WHITE' && !game?.boards[cbId].sideToMove)
        )
            return false;

        const moveData: MoveData = {
            fromSq: from,
            toSq: to,
            droppedPiece: piece[1].toLowerCase(),
            promotion: piece[1].toLowerCase() as MoveData['promotion'],
        };

        return makeMove(moveData);
    };

    const getCustomSquareStyles = () => {
        let styles: {[key: string]: React.CSSProperties} = {};

        if (attackedKingSquare) styles[attackedKingSquare] = { backgroundColor: 'red' };
        if (lastMoveFromSquare) styles[lastMoveFromSquare] = { backgroundColor: 'beige' };
        if (lastMoveToSquare) {
            if (!lastMoveFromSquare) {
                styles[lastMoveToSquare] = { backgroundColor: 'chocolate' };
            }
            else {
                styles[lastMoveToSquare] = { backgroundColor: 'beige' };
            }
        }

        return styles;
    };

    return (
        <>
            {game && (
                <div className="w-95vw lg:w-60dvh">
                    {cbId}
                    <Chessboard
                        position={localFen}
                        onPieceDrop={onDrop}
                        id={cbId}
                        boardOrientation={
                            playerSide !== 'SPECTATOR' ? (playerSide.toLowerCase() as BoardOrientation) : 'black'
                        }
                        isDraggablePiece={({ piece }) => {
                            return (
                                game?.status === GameStatus.ONGOING
                                && playerSide !== 'SPECTATOR'
                                && ((playerSide === 'WHITE' && piece[0] === WHITE && game.boards[cbId].sideToMove) ||
                                    (playerSide === 'BLACK' && piece[0] === BLACK && !game.boards[cbId].sideToMove))
                            );
                        }}
                        onPromotionCheck={isPromotion}
                        customSquareStyles={getCustomSquareStyles()}
                        showBoardNotation={false}
                    />
                </div>
            )}
        </>
    );
};

export default GameChessboard;
