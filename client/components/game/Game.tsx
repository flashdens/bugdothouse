import TestChessboard from "@/components/test/TestChessboard";
import TestPocket from "@/components/test/TestPocket";
import React, { useContext, useEffect, useState } from "react";
import HTML5Backend from "@/services/CustomHTML5Backend";
import { DndProvider } from "react-dnd";
import GameContext, {GameContextData} from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";

interface GameProps {
    gameData: GameContextData
}

const Game: React.FC<GameProps> = ({ gameData }) => {
    const { gameContextData, updateGameContext } = useContext(GameContext);
    const { user } = useContext(AuthContext);
    const [side, setSide] = useState<'WHITE' | 'BLACK' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log(user);
        if (!gameContextData)
            updateGameContext(gameData);

        if (gameContextData && user) {
            if (gameContextData.whitePlayer.id === user.user_id) {
                setSide('WHITE');
            } else if (gameContextData.blackPlayer.id === user.user_id) {
                setSide('BLACK');
            }
            setLoading(false);
        }
    }, [gameContextData, user, loading]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        // context=window fixes two backends error?
        <DndProvider backend={HTML5Backend} context={window}>
            {side && (
                <>
                    <TestPocket pocketOf={side === "WHITE" ? "BLACK" : "WHITE"} side={side} />
                    <TestChessboard side={side} />
                    <TestPocket pocketOf={side} side={side} />
                </>
            )}
        </DndProvider>
    );
};

export default Game;
