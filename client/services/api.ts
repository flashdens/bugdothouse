import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import SERVER_URL from "@/config";
import {jwtDecode} from "jwt-decode";
import {toast} from "react-toastify";
import Router from "next/router";

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

    if (!tokens || jwtDecode(tokens.access).exp! > Date.now() / 1000) {
        return false;
    }

    if (tokens.refresh && !isAwaitingNewToken) {
        isAwaitingNewToken = true;

        try {
            const response = await fetch(`${SERVER_URL}/api/auth/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: tokens.refresh }),
            });

            const data = await response.json();
            isAwaitingNewToken = false;

            if (response.status === 200) {
                localStorage.setItem('authTokens', JSON.stringify(data));
                return true;
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            isAwaitingNewToken = false;
        }
    } else if (!tokens.refresh) {
        alert("Unauthorized to refresh the auth token! Guest accounts can only play for 30 minutes");
        await Router.push('/');
        return false;
    }

    return false;
}


api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        let tokens = getAuthTokens();
        if (tokens) {
            if (config.method == "post") {
                config.headers!['Authorization'] = `Bearer ${tokens.access}`;
            }
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
        if (error.response && error.response.status == 401 && !isAwaitingNewToken) {
            if (await refreshToken() === true) {
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + getAuthTokens().access;
                return api(originalReq);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
