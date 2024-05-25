import { useRouter } from 'next/router'
import Lobby from "@/components/Lobby";
import {useContext, useEffect, useState} from "react";
import SERVER_URL from "@/config";
import GameContext, {GameProvider, GameContextData} from "@/context/GameContext";
import Game from "@/pages/game";
import AuthContext from "@/context/AuthContext";
const GameIndex = ({ gameCode }) => {
    const [game, setGame] = useState<GameContextData | null>(null);
    const router = useRouter();
    const {authTokens, user, loginUser} = useContext(AuthContext);


    useEffect(() => {
        if (!gameCode) return;

        fetch(`${SERVER_URL}/api/join/${gameCode}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...(authTokens && { authTokens })
            })
        })
            .then(response => {
                if (!response.ok)
                    throw new Error('upsi');
                return response.json();
            })
            .then(data => {
                if (data.error)
                    throw new Error(data.error);
                if (data.guestToken)
                    loginUser(undefined, data.guestToken);

                return fetch(`${SERVER_URL}/api/game/${gameCode}/`, {
                    method: 'GET',
                });
            })
            .then(response => {
                if (!response.ok) {
                    void router.push('/404');
                    throw new Error('Response not OK');
                }
                return response.json();
            })
            .then(data => {
                setGame(data);
            })
            .catch(error => {
                console.error('Error fetching game:', error);
            });
    }, [gameCode, router, authTokens, loginUser]);

    return (
        <>
            {game != null ? (
                <GameProvider>
                    {game.status === 'waiting_for_start' ? (
                        <Lobby gameData={game} />
                    ) : game.status === 'ongoing' ? (
                        <Game />
                    ) : (
                        <div>this will be a match history</div>
                    )}
                </GameProvider>
            ) : (
                <div>waiting...</div>
            )}
        </>
    );

}

export default GameIndex;

export async function getServerSideProps(context: any) {
    const gameCode: string = context.params.gameCode;

    return {
        props: {
            gameCode,
        },
    }
}