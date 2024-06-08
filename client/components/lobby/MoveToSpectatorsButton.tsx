import React from "react";

interface Props {
    wsSendCallback: (moveTo: string) => void;
}

const MoveToSpectatorsButton: React.FC<Props> = ({ wsSendCallback }) => {
    return (
        <button
            onClick={() => wsSendCallback("spectator")}
            className="gray-button"
        >
            Back to spectators
        </button>
    );
}

export default MoveToSpectatorsButton;
