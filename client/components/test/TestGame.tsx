import TestChessboard from "@/components/test/TestChessboard";
import TestWhitePocket from "@/components/test/TestPocket";
import React, { useContext } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Player } from "@/pages/game";
import GameContext, { GameProvider } from "@/context/GameContext";

interface TestGameProps {
    player: Player;
}

const TestGame: React.FC<TestGameProps> = ({ player }) => {
    const {loading, error } = useContext(GameContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <GameProvider>
            <DndProvider backend={HTML5Backend} context={window}>
                    <TestChessboard player={player} />
                    <TestWhitePocket side={player.side} />
            </DndProvider>
        </GameProvider>
    );
};

export default TestGame;