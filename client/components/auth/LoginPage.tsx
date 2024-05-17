import React, {useContext} from 'react'
import AuthContext from "@/context/AuthContext";
import {useRouter} from "next/router";

const LoginPage = () => {

    const authContext = useContext(AuthContext);

    if (!authContext) {
        return <div>Loading...</div>;
    }

    let { loginUser} = authContext;

    return (
        <div>
            <form onSubmit={loginUser}>
                <input type="text" name="username" placeholder="Enter username"/>
                <input type="password" name="password" placeholder="enter password"/>
                <button type={"submit"}>login </button>
            </form>
        </div>
    )
}

export default LoginPage