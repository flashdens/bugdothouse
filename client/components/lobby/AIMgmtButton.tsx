import React from "react";

interface AiMgmtButtonProps {
    setIsAIPlayerSet: React.Dispatch<React.SetStateAction<boolean>>
    sendWSAIEv: (switchTo: number, subgameId: number, msgType: 'aiAdd' | 'aiRemove' ) => {}
    switchTo: number,
    subgameId: number,
    msgType: 'aiAdd' | 'aiRemove',
}

const AIMgmtButton:React.FC<AiMgmtButtonProps> = ( {setIsAIPlayerSet, sendWSAIEv, switchTo, subgameId, msgType}) => {
   return(
       <>
           <button
               className={"bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"}
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