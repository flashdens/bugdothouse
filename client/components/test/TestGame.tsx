import TestChessboard from "@/components/test/TestChessboard";
import TestWhitePocket from "@/components/test/TestWhitePocket";
import React from "react";

interface TestGameProps {
    side: 'w' | 'b' | null;
}

const TestGame: React.FC<TestGameProps> = ( {side} ) => {
    return (
        <div>
            <TestChessboard side={side}/>
            <TestWhitePocket/>
        </div>
    )
}

export default TestGame;