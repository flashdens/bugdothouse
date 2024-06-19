import {AuthProvider} from "@/context/AuthContext";
import Navbar from "@/components/navbar/Navbar";
import React from "react";
import logo from "@/public/logo.svg"
import Image from "next/image";
import Hero from "@/components/index/Hero";
import {ToastContainer} from "react-toastify";
import  Head from "next/head";

const Index = () => {
    return (
        <>
            <Head>
                <title>bug.house</title>
            </Head>
            <AuthProvider>
                <Hero/>
            </AuthProvider>
        </>
    )
}

export default Index;