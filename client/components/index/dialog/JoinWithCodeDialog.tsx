import React from "react";
import Dialog from "@/components/Dialog";

interface JoinWithCodeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const JoinWithCodeDialog: React.FC<JoinWithCodeDialogProps> = ({ isOpen, onClose}) => {
    return(
        <Dialog isOpen={isOpen} onClose={onClose} title="Join with game code"
                animation={"animate-in slide-in-from-bottom duration-300"}
        >
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        </Dialog>
    );
}

export default JoinWithCodeDialog;
