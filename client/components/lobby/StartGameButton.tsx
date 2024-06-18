import React from "react";

/**
 * @interface StartGameButton
 * @brief Props komponentu StartGameButton.
 *
 * @property {function} startGame callback do funkcji startującej grę.
 * @property {boolean} isDisabled wartość określająca, czy przycisk można wcisnąć.
 */
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