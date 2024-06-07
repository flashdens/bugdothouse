import {AuthProvider} from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import PrivateRoute from "@/services/PrivateRoute";
import HomePage from "@/components/auth/HomePage";
import React from "react";
import logo from "@/public/logo.svg"
import Image from "next/image";
import Hero from "@/components/Hero";

const Index = () => {
    return (
        <>
            <AuthProvider>
                    <Navbar/>
                    <Hero/>
                    <Image src={logo} alt={logo}></Image>
                    <HomePage/>
            </AuthProvider>
        </>
    )
}

export default Index;