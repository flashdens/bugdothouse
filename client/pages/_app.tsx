import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {AuthProvider} from "@/context/AuthContext";
import {ToastContainer} from "react-toastify";
import React from "react";
import Navbar from "@/components/navbar/Navbar";
import InfoFloatingButton from "@/components/InfoFloatingButton";
import Background from "@/components/global/Background";

export default function App({ Component, pageProps }: AppProps) {
  return(
      <AuthProvider>
          <Background/>
          <Navbar/>
          <Component {...pageProps} />
          <ToastContainer/>
          <InfoFloatingButton/>
      </AuthProvider>
  );
}
