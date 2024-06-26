import React, { useContext, useEffect, useState } from 'react';
import NewGameDialog from "@/components/index/dialog/NewGameDialog";
import HowToPlayDialog from "@/components/index/dialog/HowToPlayDialog";
import logo from "@/public/logo.svg";
import Image from "next/image";
import GameListDialog from "@/components/index/dialog/GameListDialog";
import authContext from "@/context/AuthContext";
import JoinWithCodeDialog from "@/components/index/dialog/JoinWithCodeDialog";
import LoginDialog from "@/components/navbar/dialog/LoginDialog";

const Hero = () => {
    const [isHowToPlayDialogOpen, setIsHowToPlayDialogOpen] = useState(false);
    const [isNewGameDialogOpen, setNewGameDialogOpen] = useState(false);
    const [isRoomListDialogOpen, setIsRoomListDialogOpen] = useState(false);
    const [isJoinWithCodeDialogOpen, setIsJoinWithCodeDialogOpen] = useState(false);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const { user, authTokens } = useContext(authContext);

    useEffect(() => {
        setIsRendered(true);
    }, []);

    if (!isRendered) {
        return null;
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="h-full flex flex-col justify-center items-center p-10 bg-white rounded-lg shadow-2xl">
                <div className="flex justify-center">
                    <Image className="h-16 w-16" src={logo} alt={"logo"} />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-2">
                    bug.house
                </h1>
                <span className={'text-lg'}>Play bughouse chess online!</span>
                <div className="w-full flex flex-col items-center space-y-6 mt-4">
                    <button
                        onClick={
                        user
                            ? () => setNewGameDialogOpen(true)
                            : () => setIsLoginDialogOpen(true)
                        }
                        className={`${authTokens?.refresh ? 'pink-button' : 'gray-button'} w-full max-w-sm text-xl`}
                    >
                        {authTokens?.refresh ? 'CREATE A NEW GAME' : 'LOG IN TO CREATE GAMES'}
                    </button>
                    <NewGameDialog
                        isOpen={isNewGameDialogOpen}
                        onClose={() => setNewGameDialogOpen(false)}
                    />
                    <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />

                    <button
                        onClick={() => setIsRoomListDialogOpen(true)}
                        className="pink-button w-full max-w-sm text-xl"
                    >
                        SEE OPEN ROOMS
                    </button>
                    <GameListDialog
                        isOpen={isRoomListDialogOpen}
                        onClose={() => setIsRoomListDialogOpen(false)}
                    />

                    <button
                        onClick={() => setIsJoinWithCodeDialogOpen(true)}
                        className="pink-button w-full max-w-sm text-xl"
                    >
                        JOIN WITH CODE
                    </button>
                    <JoinWithCodeDialog
                        isOpen={isJoinWithCodeDialogOpen}
                        onClose={() => setIsJoinWithCodeDialogOpen(false)}
                    />

                    <button
                        className="gray-button w-full max-w-sm text-xl"
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
        </div>
    );
};

export default Hero;
