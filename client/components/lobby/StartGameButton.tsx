import React from "react";

interface StartGameButtonProps {
    startGame: () => void;
    isDisabled: boolean;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ startGame, isDisabled }) => {
    return (
        <button className={"bg-transparent my-4 hover:bg-pink-500 text-pink-700 disabled:text-pink-200 font-semibold hover:text-white py-2 px-4 border border-pink-500 disabled:border-pink-200 hover:border-transparent rounded disabled:pointer-events-none"}
                onClick={startGame}
                disabled={isDisabled}>
            Start game
        </button>
    )
}

export default StartGameButton;