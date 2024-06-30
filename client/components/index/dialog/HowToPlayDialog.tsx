import React from "react";
import Dialog from "@/components/Dialog";

interface HowToPlayDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const HowToPlayDialog: React.FC<HowToPlayDialogProps> = ({ isOpen, onClose}) => {
    return(
     <Dialog isOpen={isOpen} onClose={onClose} title="How To play?"
                animation={"animate-in slide-in-from-bottom duration-300"}
        >
         <div>

         <p>Bughouse chess is a team-based variant played by four players in pairs, using two chessboards. Each team consists of two players sitting side by side. One player handles the white pieces on one board, while their partner handles the black pieces on the adjacent board.</p>

         <p>The game involves capturing opponent pieces and passing them to your partner, who can then place them on their board as a move instead of making a regular move. Pieces must be placed legally according to standard chess rules. The objective remains the same as in traditional chess: to checkmate the opponent&apos;s king.</p>
         </div>
     </Dialog>
    );
}

export default HowToPlayDialog;