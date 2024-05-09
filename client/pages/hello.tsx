import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PrivateRoute from '@/services/PrivateRoute';
import HomePage from '@/components/auth/HomePage';
import LoginPage from '@/components/auth/LoginPage';
import Header from '@/components/Header';
import {AuthProvider} from "@/context/AuthContext";

interface User {
    username: string;
}

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const logoutUser = (e: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
        e.preventDefault();
        // Add your logout logic here
    };

    return (
        <div className="App">
            <AuthProvider>
            <nav className={"bg-pink-200"}>
                <Header/>
            </nav>
            {user && <p>Hello {user.username}!</p>}
            <PrivateRoute>
                <HomePage />
            </PrivateRoute>
            </AuthProvider>
        </div>
    );
};

export default App;
