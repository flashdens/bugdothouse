import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import SERVER_URL from "@/config";
import {jwtDecode} from "jwt-decode";
import {toast} from "react-toastify";

const api: AxiosInstance = axios.create({
    baseURL: `${SERVER_URL}/api/`,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAuthTokens = () => {
    const authTokens = localStorage.getItem('authTokens');
    return authTokens ? JSON.parse(authTokens) : null;
};

export const refreshToken = async () => {
    const tokens = getAuthTokens();
    const decodedAccess = jwtDecode(tokens.access);
    if (decodedAccess.exp! < Date.now() / 1000) {
        const response = await fetch(`${SERVER_URL}/api/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: tokens.refresh }),
        });

        const data = await response.json();
        if (response.status === 200) {
            console.log(data)
            localStorage.setItem('authTokens', JSON.stringify(data));
        } else {
            alert("Unauthorized to refresh the auth token! Guest accounts can only play for 30 minutes");
            toast.error('Unauthorized to refresh token');
        }
    }

}


api.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
        const tokens = getAuthTokens();
        if (tokens && tokens.refresh) {
            const decodedAccess = jwtDecode(tokens.access);
            if (decodedAccess.exp! < Date.now() / 1000) {
                  await refreshToken();
            }
            config.headers!['Authorization'] = `Bearer ${tokens.access}`;
        }
        // else if (tokens.access) {
        //     alert("Unauthorized to refresh the auth token! Guest accounts can only play for 30 minutes. If you're a registered user, please log in again.");
        // }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        return Promise.reject(error);
    }
);

export default api;
