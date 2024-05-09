import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import HomePage from '@/components/auth/HomePage';
import LoginPage from '@/components/auth/LoginPage';
import Header from '@/components/Header';

interface User {
    username: string;
}

const App: React.FC = () => {
    const [user, setUser] = useState<User|null>(null);
    const router = useRouter();

    const logoutUser = (e: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
        e.preventDefault();
        // Add your logout logic here
    }

    return (
        <div className="App">
            <Header />
            <nav>
                <Link href="/">Home</Link>
                <span> | </span>
                {user ? (
                    <p onClick={logoutUser}>Logout</p>
                ) : (
                    <Link href="/login">Login</Link>
                )}
            </nav>
            {user && <p>Hello {user.username}!</p>}

            {router.pathname === '/' && <HomePage />}
            {router.pathname === '/login' && <LoginPage />}
        </div>
    );
}

export default App;
