import React, { createContext, useState, ReactNode, FormEvent, useEffect } from "react";
import {jwtDecode, JwtHeader, JwtPayload} from 'jwt-decode';
import { useRouter } from 'next/router';
import SERVER_URL from "@/config";
import {toast, ToastContainer} from "react-toastify";
import assert from "assert";
import Router from 'next/router'


interface AuthTokens {
    access: string;
    refresh: string;
}

interface AuthContext {
    user: JwtPayload & {user_id: number, username: string} | null,
    authTokens: AuthTokens;
    loginUser: (e?: FormEvent<HTMLFormElement>, data?: AuthTokens, guestToken?: any ) => Promise<void>;
    logoutUser: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    registerUser: any
}

const AuthContext = createContext<AuthContext>(null);
export default AuthContext;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
      let [user, setUser] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('authTokens') !== 'null' && localStorage.getItem('authTokens')) {
            return jwtDecode(localStorage.getItem('authTokens'));
        }
        return null;
    });

    let [authTokens, setAuthTokens] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('authTokens') != 'null' && localStorage.getItem('authTokens') ) {
            return JSON.parse(localStorage.getItem('authTokens'));
        }
        return null;
    });

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loginUser = async (e?: FormEvent<HTMLFormElement>, data?: AuthTokens, guestToken?: any) => {
        if (e) e.preventDefault();

        let respData = null;

        if (!data && e) {
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

            respData = await response.json() /*as { access: AuthTokens, error?: string };*/
            console.log(data);
            if (!response.ok) {
                toast.error(respData.detail)
                return;
            }
        }

        if (guestToken) {
            console.log(guestToken);
            setUser(jwtDecode(guestToken.access));
            setAuthTokens(guestToken)
            localStorage.setItem('authTokens', JSON.stringify(guestToken));
        }
        else if (respData) {
            setUser(jwtDecode(respData.access));
            setAuthTokens(data);
            localStorage.setItem('authTokens', JSON.stringify(respData));
        }
        else {
            assert(false);
        }

        Router.reload();
    };

    const logoutUser = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (e) e.preventDefault();

        localStorage.removeItem('authTokens');
        setAuthTokens(null);
        setUser(null);

        Router.reload();
    };

    const registerUser = async (e: any) => {
        try {
            e.preventDefault();

            const { username, email, password, repeatPassword, consent } = e.currentTarget;

            if (!consent.checked) {
                return { success: false, message: 'You must agree to the website rules.' };
            }

            if (password.value !== repeatPassword.value) {
                return { success: false, message: 'Passwords do not match.' };
            }

            const response = await fetch(`${SERVER_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.value,
                    email: email.value,
                    password: password.value,
                    consent: consent.value
                })
            });

            const data = await response.json();
            if (!response.ok) {
                return { success: false, message:
                    data.username[0] || data.email[0]};
            }

            return { success: true, data };

        } catch (error: any) {
            return { success: false, message: error.message };
        }
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
            alert("Unauthorized to refresh the auth token! " +
                "Guest accounts can only play for 30 minutes")
            logoutUser();
        }

        if (loading) {
            setLoading(false);
        }
    };

    useEffect(() => {
        const REFRESH_INTERVAL = 1000 * 60 * 30; // 30 minutes
        let interval: NodeJS.Timeout =
            setInterval(() => {
                if (authTokens) {
                    void updateToken();
                }
            }, REFRESH_INTERVAL);
        return () => clearInterval(interval);

    }, [authTokens]);

    const contextData: AuthContext = {
        user: user as JwtPayload & {user_id: number, username: string},
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        registerUser: registerUser
    };

    return (
        <>
            <AuthContext.Provider value={contextData}>
            {children}
            </AuthContext.Provider>
        </>
    );
};
