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

let isAwaitingNewToken = false;

export const getAuthTokens = () => {
    const authTokens = localStorage.getItem('authTokens');
    return authTokens ? JSON.parse(authTokens) : null;
};

export const refreshToken = async () => {
    const tokens = getAuthTokens();
    const decodedAccess = jwtDecode(tokens.access);
    if (decodedAccess.exp! < Date.now() / 1000 && !isAwaitingNewToken) {
        isAwaitingNewToken = true;
        const response = await fetch(`${SERVER_URL}/api/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: tokens.refresh }),
        });

        const data = await response.json();
        if (response.status === 200) {
            localStorage.setItem('authTokens', JSON.stringify(data));
            return true;
        } else {
            alert("Unauthorized to refresh the auth token! Guest accounts can only play for 30 minutes");
            toast.error('Unauthorized to refresh token');
            return false;
        }

        isAwaitingNewToken = false;
    }
}

api.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
        let tokens = getAuthTokens();
        if (tokens) {
            // const decodedAccess = jwtDecode(tokens.access);
            // if (decodedAccess.exp! < Date.now() / 1000) {
            //       await refreshToken();
            // }
            // tokens = getAuthTokens();
            config.headers!['Authorization'] = `Bearer ${tokens.access}`;
        }

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
        const originalReq = error.config;
        if (error.response.status == 401 && !originalReq._retry) {
            originalReq._retry = true;
            if (await refreshToken() === true) {
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + getAuthTokens().access;
                return api(originalReq);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
