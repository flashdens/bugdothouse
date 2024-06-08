import React, {useContext, useEffect, useState} from 'react';
import NewGameDialog from "@/components/index/dialog/NewGameDialog";
import HowToPlayDialog from "@/components/index/dialog/HowToPlayDialog";
import logo from "@/public/logo.svg";
import krowcia from "@/public/krowcia.gif"
import Image from "next/image";
import { useRouter } from 'next/router';
import GameListDialog from "@/components/index/dialog/GameListDialog";
import authContext from "@/context/AuthContext";
import SERVER_URL from "@/config";
import Background from "@/components/global/Background";
import JoinWithCodeDialog from "@/components/index/dialog/JoinWithCodeDialog";

const HeroSection = () => {
    const [isHowToPlayDialogOpen, setIsHowToPlayDialogOpen] = useState(false);
    const [isNewGameDialogOpen, setNewGameDialogOpen] = useState(false);
    const [isRoomListDialogOpen, setIsRoomListDialogOpen] = useState(false);
    const [isJoinWithCodeDialogOpen, setIsJoinWithCodeDialogOpen] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const {user, authTokens} = useContext(authContext);
    const router = useRouter();

    useEffect(() => {
        setIsRendered(true);
    }, []);


    if (!isRendered) {
        return null;
    }

    return (
       <div className="flex justify-center items-center min-h-screen">
           <Background/>
            <div className="h-full flex flex-col justify-center items-center p-10 bg-white rounded-lg shadow-2xl">
                <div className="flex justify-center">
                    <Image className="h-16 w-16" src={logo} alt={"logo"} />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-2">
                    bug.house
                </h1>
                <span>Play bughouse chess online!</span>

                <button
                    onClick={() => setNewGameDialogOpen(true)}
                    className="pink-button my-2"
                    disabled={!user || !authTokens.refresh} // guests don't own refresh tokens
                >
                    CREATE A NEW GAME
                </button>
                <NewGameDialog
                    isOpen={isNewGameDialogOpen}
                    onClose={() => setNewGameDialogOpen(false)}
                />

                <button
                    onClick={() => setIsRoomListDialogOpen(true)}
                    className="pink-button my-2"
                >
                    SEE OPEN ROOMS
                </button>
                <GameListDialog
                    isOpen={isRoomListDialogOpen}
                    onClose={() => setIsRoomListDialogOpen(false)}
                />

                <button
                    onClick={() => setIsJoinWithCodeDialogOpen(true)}
                    className="blue-button my-2"
                >
                    JOIN WITH CODE
                </button>
                <JoinWithCodeDialog
                    isOpen={isJoinWithCodeDialogOpen}
                    onClose={() => setIsJoinWithCodeDialogOpen(false)}
                />

                <button
                    className="gray-button my-2"
                    onClick={() => setIsHowToPlayDialogOpen(true)}
                >
                    How to play bughouse?
                </button>
                <HowToPlayDialog
                    isOpen={isHowToPlayDialogOpen}
                    onClose={() => setIsHowToPlayDialogOpen(false)}
                />
            </div>
        </div>
    );
};

export default HeroSection;
