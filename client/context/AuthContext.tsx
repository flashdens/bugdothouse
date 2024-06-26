import React, {createContext, FormEvent, ReactNode, useEffect, useState} from "react";
import { jwtDecode, JwtPayload } from 'jwt-decode';
import Router, { useRouter } from 'next/router';
import SERVER_URL from "@/config";
import { toast } from "react-toastify";
import api, {getAuthTokens} from "@/services/api";

interface AuthTokens {
    access: string;
    refresh: string;
}

/**
 * @interface AuthContext
 * @brief Części składowe kontekstu AuthContext.
 *
 * @property {(JwtPayload & {user_id: number, username: string}) | null} user odszyfrowany żeton dostępu JWT użytkownika.
 * @property {AuthTokens} authTokens żetony dostępu oraz odświeżenia użytkownika
 *
 * @property {function} loginUser funkcja logująca użytkownika.
 * @property {function} logoutUser funkcja wylogowująca użytkownika.
 * @property {function} registerUser funkcja rejestrująca użytkownika.
 */
interface AuthContext {
    user?: (JwtPayload & { user_id: number, username: string }) | null,
    authTokens?: AuthTokens;
    loginUser: (e?: FormEvent<HTMLFormElement>, data?: AuthTokens, guestToken?: any) => Promise<void>;
    logoutUser: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    registerUser:(e: any) => Promise<{success: boolean; message: any; data?: undefined;}
        | {success: boolean; data: any; message?: undefined;}>;
}

const AuthContext = createContext<AuthContext>(null);
export default AuthContext;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedTokens = localStorage.getItem('authTokens');
            if (storedTokens) {
                return jwtDecode(storedTokens);
            }
        }
        return null;
    });

    const [authTokens, setAuthTokens] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedTokens = localStorage.getItem('authTokens');
            if (storedTokens) {
                return JSON.parse(storedTokens);
            }
        }
        return null;
    });

    const loginUser = async (e?: FormEvent<HTMLFormElement>, data?: AuthTokens, guestToken?: any) => {
        if (e) e.preventDefault();

        let respData: any = null;

        if (!data && e) {
                const response = await api.post('/auth/token/', {
                    username: e.currentTarget.username.value,
                    password: e.currentTarget.password.value
                });

                respData = response.data;
                console.log(respData)
                if (response.status !== 200 && respData) {
                    toast.error(respData.detail);
                    return;
                }

        }
        if (guestToken) {
            console.log(guestToken);
            setUser(jwtDecode(guestToken.access));
            setAuthTokens(guestToken);
            localStorage.setItem('authTokens', JSON.stringify(guestToken));
        } else if (respData) {
            setUser(jwtDecode(respData.access));
            setAuthTokens(respData);
            localStorage.setItem('authTokens', JSON.stringify(respData));
        } else {
            throw new Error('Unexpected state: no tokens available.');
        }
        Router.reload();
    };



    const logoutUser = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (e) e.preventDefault();

        localStorage.removeItem('authTokens');
        setAuthTokens(null);
        setUser(null);

        void Router.push('/');
    };

    useEffect(() => {
        if (authTokens && authTokens.refresh && jwtDecode(authTokens.refresh).exp! < Date.now() / 1000) {
            alert('Refresh token has expired. Please log in again.');
            logoutUser();
        }
    }, []);

    const registerUser = async (e: any) => {
            e.preventDefault();

            const { username, email, password, repeatPassword, consent } = e.currentTarget;

            if (!consent.checked) {
                return { success: false, message: 'You must agree to the website rules.' };
            }

            if (password.value !== repeatPassword.value) {
                return { success: false, message: 'Passwords do not match.' };
            }

            const response = await api.post(`/auth/register/`, {
                username: username.value,
                email: email.value,
                password: password.value,
                consent: consent.value
            });

        console.log(response.data)
            if (!response.data.success) {
                return { success: false, message: response.data};
            }

            return { success: true, data: response.data };

    };


    const contextData: AuthContext = {
        user: user as JwtPayload & { user_id: number, username: string },
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
