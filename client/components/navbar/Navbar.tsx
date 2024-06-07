import React, {useContext, useState} from 'react';
import Image from "next/image";
import logo from '@/public/logo.svg'
import NavbarUserSection from "@/components/navbar/NavbarUserSection";

const Navbar = () => {
    return (
        <nav className="bg-gray-200 border z-49">
            <div className="mx-auto text-xl px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center justify-center flex-1">
                        <div className="text-center">
                            <Image src={logo} alt={"logo"}/>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <NavbarUserSection/>
                    </div>
                </div>
            </div>
        </nav>
    );

};

export default Navbar;
