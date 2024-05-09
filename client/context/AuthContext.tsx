import React, { createContext, useState, ReactNode, FormEvent, useEffect } from "react";
import {jwtDecode, JwtHeader, JwtPayload} from 'jwt-decode';
import { useRouter } from 'next/router';
import SERVER_URL from "@/config";

interface AuthTokens {
    access: string;
    refresh: string;
}

interface AuthContext {
    user: JwtPayload | null;
    authTokens: AuthTokens | null;
    loginUser: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    logoutUser: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const AuthContext = createContext<AuthContext | null>(null);
export default AuthContext;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<JwtHeader | null>(() => {
        if (typeof window !== 'undefined') {
            const authTokens = localStorage.getItem('authTokens');
            return authTokens ? jwtDecode(authTokens) : null;
        }
        return null;
    });

    const [authTokens, setAuthTokens] = useState<AuthTokens | null>(() => {
        if (typeof window !== 'undefined') {
            const authTokens = localStorage.getItem('authTokens');
            return authTokens ? JSON.parse(authTokens) : null;
        }
        return null;
    });

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loginUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch(`${SERVER_URL}/auth/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: e.currentTarget.username.value, password: e.currentTarget.password.value })
        });

        const data = await response.json();

        if (data) {
            localStorage.setItem('authTokens', JSON.stringify(data));
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            await router.push('/');
        } else {
            alert('Something went wrong while logging in the user!');
        }
    };

    const logoutUser = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (e) e.preventDefault();

        localStorage.removeItem('authTokens');
        setAuthTokens(null);
        setUser(null);
        void router.push('/login');
    };

    const updateToken = async () => {
        const response = await fetch('http://127.0.0.1:8000/auth/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: authTokens?.refresh })
        });

        const data = await response.json();
        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
        } else {
            logoutUser();
        }

        if (loading) {
            setLoading(false);
        }
    };

    useEffect(() => {
        const REFRESH_INTERVAL = 1000 * 60 * 4; // 4 minutes
        let interval: NodeJS.Timeout;
        if (authTokens) {
            interval = setInterval(() => {
                void updateToken();
            }, REFRESH_INTERVAL);
        }
        return () => clearInterval(interval);

    }, [authTokens]);

    const contextData: AuthContext = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
