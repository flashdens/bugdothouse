import TestChessboard from "@/components/test/TestChessboard";
import TestPocket from "@/components/test/TestPocket";
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

    // todo don't render chessboard until context data is fetched
    return (
        <GameProvider>
            <DndProvider backend={HTML5Backend} context={window}>
                    <TestPocket side={player.side == 'WHITE' ? 'BLACK' : 'WHITE'} />
                    <TestChessboard player={player} />
                    <TestPocket side={player.side} />
            </DndProvider>
        </GameProvider>
    );
};

export default TestGame;