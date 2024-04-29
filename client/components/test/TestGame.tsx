import TestChessboard from "@/components/test/TestChessboard";
import TestWhitePocket from "@/components/test/TestPocket";
import React from "react";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";

interface TestGameProps {
    side: 'WHITE' | 'BLACK';
}

const TestGame: React.FC<TestGameProps> = ( {side} ) => {
    return (
        <div>
            <DndProvider backend={HTML5Backend} context={window}>
                <TestChessboard side={side}/>
                <TestWhitePocket/>
            </DndProvider>
        </div>
    )
}

export default TestGame;