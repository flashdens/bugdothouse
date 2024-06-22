import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import authContext, {AuthProvider} from "@/context/AuthContext";
import {ToastContainer} from "react-toastify";
import React, {useContext, useEffect} from "react";
import Navbar from "@/components/navbar/Navbar";
import InfoFloatingButton from "@/components/global/InfoFloatingButton";
import 'react-toastify/dist/ReactToastify.css';
import {getAuthTokens} from "@/services/api";

export default function App({ Component, pageProps }: AppProps) {
  return(
      <AuthProvider>
          <Navbar/>
          <Component {...pageProps} />
          <ToastContainer/>
          <InfoFloatingButton/>
      </AuthProvider>
  );
}
