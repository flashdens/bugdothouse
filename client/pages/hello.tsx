import React, {useContext, useState} from 'react';
import PrivateRoute from '@/services/PrivateRoute';
import HomePage from '@/components/auth/HomePage';
import Navbar from '@/components/Navbar';
import AuthContext, {AuthProvider} from "@/context/AuthContext";


const App: React.FC = () => {
    return (
        <div className="App">
            <nav className={"bg-pink-200"}>
                <Navbar/>
            </nav>
            <PrivateRoute>
                <HomePage />
            </PrivateRoute>
        </div>
    );
};

export default App;
