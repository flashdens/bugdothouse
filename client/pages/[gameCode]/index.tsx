import { useRouter } from 'next/router';
import Lobby from "@/components/lobby/Lobby";
import React, { useContext, useEffect, useState } from "react";
import SERVER_URL from "@/config";
import { GameContextData, GameProvider, GameStatus } from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";
import Game from "@/components/game/Game";
import { toast } from "react-toastify";
import api, { getAuthTokens } from "@/services/api";

interface GameIndexProps {
    gameCode: string
}

const Index: React.FC<GameIndexProps> = ({ gameCode }) => {
    const [game, setGame] = useState<GameContextData | null>(null);
    const router = useRouter();
    const {authTokens, loginUser} = useContext(AuthContext);
    const [shouldRerender, setShouldRerender] = useState(false);

    const handleRerender = () => {
        console.log(shouldRerender);
        setShouldRerender(prev => !prev);
        getGameInfo(gameCode);
    }

    const fetchData = async () => {
        if (!gameCode) return;
        await joinGame(gameCode);
        await getGameInfo(gameCode);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const joinGame = async (gameCode: string) => {
        const tokens = getAuthTokens();
        try {
            const response = await api.post(`${gameCode}/join/`, {
                tokens
            });
            console.log(response);

            if (response.status !== 200) {
                throw new Error('response was not ok!');
            }
            const data = response.data;

            if (data.error) throw new Error(data.error);
            if (data.guestToken) {
                console.log(data.guestToken);
                await loginUser(undefined, undefined, data.guestToken); // Await loginUser
            }

        } catch (error: any) {
            // toast.error('Error: ' + error.message);
        }
    };

    const getGameInfo = async (gameCode: string) => {
        try {
            const response = await api.get(`${gameCode}/info/`);

            if (response.status !== 200) {
                void router.push('/404');
                throw new Error('Response not OK');
            }
            const data = response.data;
            setGame(data);
        } catch (error: any) {
            console.error('Error fetching game:', error);
            toast.error('Error fetching game information.');
        }
    };

    return (
        <>
            {game != null ? (
                <GameProvider>
                    {game.status === GameStatus.WAITING_FOR_START ? (
                        <Lobby gameData={game} rerenderParent={handleRerender} />
                    ) : game.status === GameStatus.ONGOING ? (
                        <Game gameData={game}/>
                    ) : (
                        <Game gameData={game}/>
                    )}
                </GameProvider>
            ) : (
                <div>waiting...</div>
            )}
        </>
    );
}

export default Index;

export async function getServerSideProps(context: any) {
    const gameCode: string = context.params.gameCode;

    return {
        props: {
            gameCode,
        },
    }
}
