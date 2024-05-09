import React, {createContext, useState, ReactNode, FormEvent, FormEventHandler} from "react";

interface User {
    username: string;
}

interface AuthContext {
    user: User | null;
    authTokens: any; // Update this to the appropriate type for authentication tokens
    loginUser: (e: any) => Promise<void> // todo
    logoutUser: (e: any) => void // TODO
}

const AuthContext = createContext<AuthContext | null>(null);

export default AuthContext;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>({username: 'milosz'});
    const [authTokens, setAuthTokens] = useState<any>(null); // Update this to the appropriate type for authentication tokens

    const loginUser = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // Add login logic here
    };

    const logoutUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // Add logout logic here
    };

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
