import TestChessboard from "@/components/test/TestChessboard";
import TestWhitePocket from "@/components/test/TestWhitePocket";
import React from "react";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";

interface TestGameProps {
    side: 'WHITE' | 'BLACK';
}

const TestGame: React.FC<TestGameProps> = ( {side} ) => {
    return (
        <div>
                <TestChessboard side={side}/>
            <DndProvider backend={HTML5Backend} context={window}>
                <TestWhitePocket/>
            </DndProvider>
        </div>
    )
}

export default TestGame;