import {useRouter} from 'next/router'
import Lobby from "@/components/lobby/Lobby";
import React, {useContext, useEffect, useState} from "react";
import SERVER_URL from "@/config";
import {GameContextData, GameProvider, GameStatus} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";
import Game from "@/components/game/Game";

interface GameIndexProps {
    gameCode: string
}

const Index: React.FC<GameIndexProps> = ({ gameCode }) => {
    const [game, setGame] = useState<GameContextData | null>(null);
    const router = useRouter();
    const {authTokens, user, loginUser} = useContext(AuthContext);
    const [shouldRerender, setShouldRerender] = useState(false);

    const handleRerender = () => {
        console.log(shouldRerender);
        setShouldRerender(prev => !prev);
        getGameInfo(gameCode);
    }

    useEffect(() => {
        if (!gameCode) return;
        joinGame(gameCode);
        getGameInfo(gameCode)
    }, [gameCode]);


    const joinGame = (gameCode: string) => {
        fetch(`${SERVER_URL}/api/${gameCode}/join/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...(authTokens && { authTokens })
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('upsi');
                return response.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                if (data.guestToken) loginUser(undefined, data.guestToken);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };


    const getGameInfo = (gameCode: string) => {
        fetch(`${SERVER_URL}/api/${gameCode}/info/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
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
    };

    return (
        <>
            {game != null ? (
                <GameProvider>
                    {game.status === GameStatus.WAITING_FOR_START ? (
                        <Lobby gameData={game} rerenderParent={handleRerender}
                        />
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