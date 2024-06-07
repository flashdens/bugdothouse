import React, { useState } from 'react';
import NewGameDialog from "@/components/index/dialog/NewGameDialog";
import HowToPlayDialog from "@/components/index/dialog/HowToPlayDialog";
import logo from "@/public/logo.svg";
import krowcia from "@/public/krowcia.gif"
import Image from "next/image";
import { useRouter } from 'next/router';
import RoomListDialog from "@/components/index/dialog/RoomListDialog";

const HeroSection = () => {
    const [isHowToPlayDialogOpen, setIsHowToPlayDialogOpen] = useState(false);
    const [isNewGameDialogOpen, setNewGameDialogOpen] = useState(false);
    const [isRoomListDialogOpen, setIsRoomListDialogOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="flex justify-center z-50 items-center">
             <div>
               <Image className={"w-full"} src={krowcia} alt={"krowcia"}/>
            </div>

            <div className="absolute top-0 left-0 z-10 w-full h-full flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className={"flex justify-center"}>
                        <Image className={"h-16 w-16"} src={logo} alt={logo}/>
                    </div>
                    <h1 className="text-4xl md:text-6xl text-black lg:text-white font-bold mb-2">
                        bug.house
                    </h1>
                    <span className={"text-black lg:text-white"}>Play bughouse chess online!</span>

                        <button onClick={() => setNewGameDialogOpen(true)}
                                className="my-2 bg-transparent hover:bg-pink-500 text-pink-700 font-semibold hover:text-white py-2 px-4 border border-pink-500 hover:border-transparent rounded"
                        >
                            CREATE A NEW GAME
                        </button>
                        <NewGameDialog
                            isOpen={isNewGameDialogOpen}
                            onClose={() => setNewGameDialogOpen(false)}
                        />

                     <button onClick={() => setIsRoomListDialogOpen(true)}
                                className="my-2 bg-transparent hover:bg-pink-500 text-pink-700 font-semibold hover:text-white py-2 px-4 border border-pink-500 hover:border-transparent rounded"
                        >
                            SEE GAME ROOMS
                        </button>
                        <RoomListDialog
                            isOpen={isRoomListDialogOpen}
                            onClose={() => setIsRoomListDialogOpen(false)}
                        />

                    <button className={"blue-button bg-blue-300"} onClick={() => setIsHowToPlayDialogOpen(true)}>
                        How to play?
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

export default HeroSection;