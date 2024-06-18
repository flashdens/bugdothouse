import React from 'react';
import Image from "next/image";
import logo from '@/public/logo.svg';
import NavbarUserSection from "@/components/navbar/NavbarUserSection";
import Link from "next/link";

const Navbar = () => {
    return (
        <nav className="z-49 top-0 left-0 right-0 w-full">
            <div className="mx-auto text-xl px-4 my-2">
                <div className="flex items-center justify-between h-16">
                        <Link href={'/'}>
                            <Image src={logo} alt={"logo"} />
                        </Link>
                    <div className="bg-white rounded-lg shadow-2xl">
                        <NavbarUserSection />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
