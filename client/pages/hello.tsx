import React, {useContext, useState} from 'react';
import PrivateRoute from '@/services/PrivateRoute';
import HomePage from '@/components/auth/HomePage';
import Header from '@/components/Header';
import AuthContext, {AuthProvider} from "@/context/AuthContext";


const App: React.FC = () => {
    return (
        <div className="App">
            <AuthProvider>
            <nav className={"bg-pink-200"}>
                <Header/>
            </nav>
            <PrivateRoute>
                <HomePage />
            </PrivateRoute>
            </AuthProvider>
        </div>
    );
};

export default App;
