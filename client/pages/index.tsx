import {AuthProvider} from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import PrivateRoute from "@/services/PrivateRoute";
import React from "react";
import logo from "@/public/logo.svg"
import Image from "next/image";
import Hero from "@/components/index/Hero";

const Index = () => {
    return (
        <>
            <AuthProvider>
                    <Navbar/>
                    <Hero/>
            </AuthProvider>
        </>
    )
}

export default Index;