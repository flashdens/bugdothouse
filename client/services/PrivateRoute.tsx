import React, {useContext, useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import AuthContext from "@/context/AuthContext";

interface PrivateRouteProps {
    children: ReactNode;
}
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const authContext = useContext(AuthContext);
    const router = useRouter();

    if (!authContext) {
        // Handle the case where AuthContext is null
        return <div>Loading...</div>;
    }
    let {user} = authContext;
    useEffect(() => {
        if (!user) void router.push('/login');
    }, []);

    return (user ? <>{children}</> : null);
}

export default PrivateRoute;
