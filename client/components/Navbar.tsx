import React, { useState } from 'react';
import Image from "next/image";
import logo from '@/public/logo.svg'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-gray-200 border z-49">
            <div className="mx-auto text-xl px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center justify-center flex-1">
                        <div className="text-center">
                            <Image src={logo} alt={'logo'}/>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <div>
                            login
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                    </div>
                </div>
            </div>
        </nav>
    );

};

export default Navbar;
