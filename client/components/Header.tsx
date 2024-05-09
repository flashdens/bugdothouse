import React, { useContext } from 'react';
import Link from 'next/link';
import AuthContext from "@/context/AuthContext";

const Header: React.FC = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return <div>Loading...</div>;
    }

    const { user, logoutUser } = authContext;

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
