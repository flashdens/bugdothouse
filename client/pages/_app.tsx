import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {AuthProvider} from "@/context/AuthContext";
import {ToastContainer} from "react-toastify";
import React from "react";
import Navbar from "@/components/navbar/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  return(
      <AuthProvider>
          <Navbar/>
          <Component {...pageProps} />
          <ToastContainer/>
      </AuthProvider>
  );
}
