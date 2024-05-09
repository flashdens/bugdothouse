import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '@/context/AuthContext';
import SERVER_URL from "@/config";

interface Profile {
    username: string;
    elo: number;
}

const HomePage = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return(<div>loading</div>)
    }

    const { authTokens, logoutUser } = authContext;
    let [profile, setProfile] = useState<Profile|null>(null);

    useEffect(() => {
        getProfile()
    },[])

    const getProfile = async() => {
        if (!authTokens) return;
        let response = await fetch(`${SERVER_URL}/social/profile`, {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()
        console.log(data)
        if(response.status === 200){
            setProfile(data)
        } else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    return (
        profile ? (
        <div>
            <p>You are logged in to the homepage!</p>
            <p>Username: {profile.username} </p>
            <p>Elo: {profile.elo}</p>
        </div>
        ) : <div></div>
    )
}

export default HomePage;
