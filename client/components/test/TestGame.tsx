import TestChessboard from "@/components/test/TestChessboard";
import TestWhitePocket from "@/components/test/TestPocket";
import React from "react";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";
import {IPlayer} from "@/pages/game";
import {GameProvider} from "@/context/GameContext";

interface TestGameProps {
    player: IPlayer;
}

const TestGame: React.FC<TestGameProps> = ( {player} ) => {
    return (
        <div>
            <GameProvider>
                <DndProvider backend={HTML5Backend} context={window}>
                    <TestChessboard player={player}/>
                    <TestWhitePocket side={player.side}/>
                </DndProvider>
            </GameProvider>
        </div>
    )
}

export default TestGame;