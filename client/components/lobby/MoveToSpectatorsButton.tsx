import React from "react";

interface Props {
    wsSendCallback: (moveTo: string) => void;
}

const MoveToSpectatorsButton: React.FC<Props> = ({ wsSendCallback }) => {
    return (
        <button
            onClick={() => wsSendCallback("spectator")}
            className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
        >
            Back to spectators
        </button>
    );
}

export default MoveToSpectatorsButton;
