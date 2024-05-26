import React from "react";

interface StartGameButtonProps {
    startGame: () => void;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ startGame }) => {
    return (
        <button className={"bg-transparent my-4 hover:bg-pink-500 text-pink-700 font-semibold hover:text-white py-2 px-4 border border-pink-500 hover:border-transparent rounded"}
                onClick={startGame}>
            Start game
        </button>
    )
}

export default StartGameButton;