import Lobby from "@/components/test/Lobby"
import {AuthProvider} from "@/context/AuthContext";
import Header from "@/components/Header";
import PrivateRoute from "@/services/PrivateRoute";
import HomePage from "@/components/auth/HomePage";
import React from "react";

const Index = () => {
    return (
        <>
            <div className="App">
                <AuthProvider>
                    <nav className={"bg-pink-200"}>
                        {/*<Header/>*/}
                    </nav>
                        <HomePage/>
                </AuthProvider>
            </div>
            <Lobby/>
        </>
    )
}

export default Index;