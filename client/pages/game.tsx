import React, {useContext, useEffect, useState} from "react";
import TestGame from "@/components/test/TestGame";
import Dialog from "@/components/test/Dialog";
import {getWebSocket} from "@/services/socket";
import GameContext, {GameProvider} from "@/context/GameContext";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AuthContext, {AuthProvider} from "@/context/AuthContext";

export interface Player {
    id: number
    username: string,
}

const Game = () => {
     return (
            <div>
                <ToastContainer/>
                <GameProvider>
                    <AuthProvider>
                        <TestGame/>
                    </AuthProvider>
                </GameProvider>
            </div>
        );
}

export default Game;
