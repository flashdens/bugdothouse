import TestChessboard from "@/components/test/TestChessboard";
import TestPocket from "@/components/test/TestPocket";
import React, { useContext, useEffect, useState } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import GameContext from "@/context/GameContext";
import AuthContext from "@/context/AuthContext";

const TestGame: React.FC = () => {
    const { gameContextData } = useContext(GameContext);
    const { user } = useContext(AuthContext);
    const [side, setSide] = useState<'WHITE' | 'BLACK' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (gameContextData && user) {
            if (gameContextData.whitePlayer === user.user_id) {
                setSide('WHITE');
            } else if (gameContextData.blackPlayer === user.user_id) {
                setSide('BLACK');
            }
            setLoading(false);
        }
    }, [gameContextData, user, loading]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
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

export default TestGame;
