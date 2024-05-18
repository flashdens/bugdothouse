'use client'

import { useRouter } from 'next/router'
import Lobby from "@/components/Lobby";
import {useContext, useEffect, useState} from "react";
import SERVER_URL from "@/config";
import GameContext, {GameProvider} from "@/context/GameContext";
import gameContext from "@/context/GameContext";

const GameIndex = () => {
    const [game, setGame] = useState(null);
    const {gameContextData,updateGameContext} = useContext(GameContext)
    const router = useRouter();
    const { gameCode } = router.query;

      useEffect(() => {
        if (!gameCode) return;

        fetch(`${SERVER_URL}/api/game/${gameCode}`, {
            method: 'GET',
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

    }, [gameCode, router]);

    return (
        <GameProvider>
            {gameContextData && gameContextData.status === 'waiting_for_start'
                ? <Lobby />
                : <div>gowno</div>}
        </GameProvider>
    );
}

export default GameIndex;
