import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import SERVER_URL from "@/config";
import {useContext} from "react";
import AuthContext from "@/context/AuthContext";
import authContext from "@/context/AuthContext";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: `${SERVER_URL}/api/`,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = JSON.parse(localStorage.getItem('authTokens'));
        if (token) {
            config.headers['Authorization'] = `Bearer ${token.access}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const {authTokens, updateToken } = useContext(authContext);

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (authTokens?.refresh) {
                await updateToken();
                // @ts-ignore
                    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
                axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
                return axiosInstance(originalRequest);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);


export default axiosInstance;
