import React from "react";

interface Props {
    wsSendCallback: (moveTo: string) => void;
}

const MoveToSpectatorsButton: React.FC<Props> = ({ wsSendCallback }) => {
    return (
        <button
            onClick={() => wsSendCallback("spectator")}
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
            Move to spectators
        </button>
    );
}

export default MoveToSpectatorsButton;
