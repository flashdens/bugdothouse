import React, { createContext, useState, ReactNode, FormEvent, useEffect } from "react";
import {jwtDecode, JwtHeader, JwtPayload} from 'jwt-decode';
import { useRouter } from 'next/router';
import SERVER_URL from "@/config";
import {toast, ToastContainer} from "react-toastify";

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
      let [user, setUser] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('authTokens')) {
            return jwtDecode(localStorage.getItem('authTokens'));
        }
        return null;
    });

    let [authTokens, setAuthTokens] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('authTokens')) {
            return JSON.parse(localStorage.getItem('authTokens'));
        }
        return null;
    });

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loginUser = async (e?: FormEvent<HTMLFormElement>, data?: any) => {
        if (e) e.preventDefault();
        if (!data) {
            const response = await fetch(`${SERVER_URL}/auth/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: e.currentTarget.username.value,
                    password: e.currentTarget.password.value
                })
            });

            if (!response.ok) {
                toast('bruh')
                return;
            }

            data = await response.json();
        }
        if (data) {
            localStorage.setItem('authTokens', JSON.stringify(data));
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            void router.push('/');

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
        const response = await fetch(`${SERVER_URL}/auth/token/refresh/`, {
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
        <>
            <AuthContext.Provider value={contextData}>
            {children}
            </AuthContext.Provider>
        </>
    );
};
