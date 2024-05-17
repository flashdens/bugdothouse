import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '@/context/AuthContext';
import SERVER_URL from "@/config";
import {toast} from "react-toastify";
import {Simulate} from "react-dom/test-utils";
import reset = Simulate.reset;
import {useRouter} from "next/router";

interface Profile {
    username: string;
    elo: number;
}

const HomePage = () => {
    const authContext = useContext(AuthContext);
    const router = useRouter();

    if (!authContext) {
        return (<div>loading</div>)
    }

    const {authTokens, loginUser, logoutUser} = authContext;
    let [profile, setProfile] = useState<Profile | null>(null);


    const getProfile = async () => {
        if (!authTokens) return;
        let response = await fetch(`${SERVER_URL}/social/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()
        if (response.status === 200) {
            setProfile(data)
        } else if (response.statusText === 'Unauthorized') {
            logoutUser()
        }
    }


    const joinGame = async (gameId: number) => {
        fetch(`${SERVER_URL}/api/test/join/${gameId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...authTokens && {authTokens}
            })
        })
            .then(response => {
                if (!response.ok)
                    throw new Error('upsi');
                return response.json()
            })
            .then(data => {
                if (data.error)
                    throw new Error(data.error)
                if (data.guestToken)
                    loginUser(undefined, data.guestToken);

                router.push(`/crazyhouse`)

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    useEffect(() => {
        void getProfile()
    }, [])

    return (
        <>
            <button onClick={() => joinGame(1)}
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            >
                Join test game
            </button>
            {profile ? (
                <div>
                    <p>You are logged in to the homepage!</p>
                    <p>Username: {profile.username} </p>
                    <p>Elo: {profile.elo}</p>
                </div>
            ) : (<div></div>)
            }
        </>
    );
};

export default HomePage;
