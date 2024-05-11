import TestChessboard from "@/components/test/TestChessboard";
import TestWhitePocket from "@/components/test/TestPocket";
import React, { useContext } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Player } from "@/pages/game";
import { GameProvider } from "@/context/GameContext";
import GameContext from "@/context/GameContext";

interface TestGameProps {
    player: Player;
}

const TestGame: React.FC<TestGameProps> = ({ player }) => {
    return (
        <div>
            <GameProvider>
                <DndProvider backend={HTML5Backend} context={window}>
                    <TestChessboard player={player} />
                    <TestWhitePocket side={player.side} />
                </DndProvider>
            </GameProvider>
        </div>
    );
};

export default TestGame;
