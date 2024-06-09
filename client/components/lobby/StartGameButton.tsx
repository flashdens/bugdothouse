import React from "react";

interface StartGameButtonProps {
    startGame: () => void;
    isDisabled: boolean;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ startGame, isDisabled }) => {
    return (
        <button className={"pink-button"}
                onClick={startGame}
                disabled={isDisabled}>
            Start game
        </button>
    )
}

export default StartGameButton;