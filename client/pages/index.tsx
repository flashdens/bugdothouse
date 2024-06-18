import {AuthProvider} from "@/context/AuthContext";
import Navbar from "@/components/navbar/Navbar";
import PrivateRoute from "@/services/PrivateRoute";
import React from "react";
import logo from "@/public/logo.svg"
import Image from "next/image";
import Hero from "@/components/index/Hero";
import {ToastContainer} from "react-toastify";

const Index = () => {
    return (
        <>
            <AuthProvider>
                <Hero/>
            </AuthProvider>
        </>
    )
}

export default Index;