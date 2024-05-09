import React, { useState } from 'react';
import Link from 'next/link';

interface User {
    username: string;
}

const Header: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    const logoutUser = (e: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
        e.preventDefault();
        // Add your logout logic here
    }

    return (
        <div>
            <Link href="/">Home</Link>
            <span> | </span>
            {user ? (
                <p onClick={logoutUser}>Logout</p>
            ) : (
                <Link href="/login">Login</Link>
            )}
            {user && <p>Hello {user.username}!</p>}
        </div>
    );
}

export default Header;
