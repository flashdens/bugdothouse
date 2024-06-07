import React, {useState} from 'react';
import Image from "next/image";
import logo from "@/public/logo.svg"
import NewGameDialog from "@/components/NewGameDialog";
import HowToPlayDialog from "@/components/test/HowToPlayDialog";

const HeroSection = () => {

    const [isHowToPlayDialogOpen, setIsHowToPlayDialogOpen] = useState(false);
    const [isNewGameDialogOpen, setNewGameDialogOpen] = useState(false);

    return (
        <div className="bg-cover bg-center h-screen" style={{ backgroundImage: 'url(/path-to-your-image.jpg)' }}>
            <div className="flex items-center justify-center h-full bg-black bg-opacity-50">
                <div className="text-center">
                    <div className={"flex justify-center"}>
                        <Image className={"h-16 w-16"} src={logo} alt={logo}/>
                    </div>
                    <h1 className="text-4xl md:text-6xl text-white font-bold my-2">
                        bug.house
                    </h1>
                    <span>Play bughouse chess online!</span>
                   <div className={'container bg-white rounded-md my-3'}>
                       <button onClick={() => setNewGameDialogOpen(true)}
                        className="bg-transparent hover:bg-pink-500 text-pink-700 font-semibold hover:text-white py-2 px-4 border border-pink-500 hover:border-transparent rounded"
                >
                    CREATE A NEW GAME
                </button>
                        <NewGameDialog
                        isOpen={isNewGameDialogOpen}
                        onClose={() => setNewGameDialogOpen(false)}
                    />
                   </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
                        Get Started
                    </button>
                    <button className={'blue-button'} onClick={() => setIsHowToPlayDialogOpen(true)}>
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
