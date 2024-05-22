import React, {useContext, useEffect} from "react";
import GameContext from "@/context/GameContext";
import gameContext from "@/context/GameContext";

interface LobbyProps {
    gameData: any
}

const Lobby: React.FC<LobbyProps> = ({ gameData }) => {

    const {gameContextData, updateGameContext} = useContext(GameContext)

    useEffect(() => {
        updateGameContext(gameData);
    }, []);
    return(
        <h1>this is a lobby page. lobby id: {gameData.code}</h1>
    )
}

export default Lobby;