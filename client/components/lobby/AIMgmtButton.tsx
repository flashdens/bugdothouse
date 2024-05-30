import React from "react";
import {PlayerRole} from "@/context/GameContext";

interface AiMgmtButtonProps {
    setIsAIPlayerSet: React.Dispatch<React.SetStateAction<boolean>>
    sendWSAIEv: (toSide: string, toSubgame: number, msgType: 'aiAdd' | 'aiRemove' ) => void
    switchTo: string,
    subgameId: number,
    msgType: 'aiAdd' | 'aiRemove',
}

const AIMgmtButton:React.FC<AiMgmtButtonProps> = ( {setIsAIPlayerSet, sendWSAIEv, subgameId, switchTo, msgType}) => {
    const color = (msgType == 'aiAdd' ? 'green' : 'red')
    return(
        <>
            <button
                className={`bg-transparent hover:bg-${color}-500 text-${color}-700 font-semibold hover:text-white py-2 px-4 border border-${color}-500 hover:border-transparent rounded`}
                onClick={() => {
                    setIsAIPlayerSet(prevState => !prevState);
                    sendWSAIEv(switchTo, subgameId, msgType);
                }}
            >
                {msgType == 'aiAdd' ? 'Add AI' : 'Remove AI'}
            </button>
        </>
    );
}

export default AIMgmtButton;