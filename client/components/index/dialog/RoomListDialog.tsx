import SERVER_URL from "@/config";
import authContext from "@/context/AuthContext";
import React, {useContext} from "react";
import {useRouter} from "next/router";
import Dialog from "@/components/Dialog";

interface RoomListDialogProps {
    isOpen: boolean;
    onClose: () => void;
}


const RoomListDialog: React.FC<RoomListDialogProps> = ({isOpen, onClose}) => {

    const {authTokens, loginUser} = useContext(authContext);
    const router = useRouter();

    const joinGame = async (gameId: number) => {
        fetch(`${SERVER_URL}/game/join/${gameId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...authTokens && {authTokens}
            })
        })
            .then(response => {
                if (!response.ok)
                    throw new Error('upsi');
                return response.json()
            })
            .then(data => {
                if (data.error)
                    throw new Error(data.error)
                if (data.guestToken)
                    loginUser(undefined, data.guestToken);

                router.push(`/game`)

            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

    return(
          <Dialog isOpen={isOpen} onClose={onClose} title="Room list"
                animation={"animate-in slide-in-from-bottom duration-300"}
        >
              Room list TODO
     </Dialog>
    )
}

export default RoomListDialog;