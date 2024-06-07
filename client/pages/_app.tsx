import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {AuthProvider} from "@/context/AuthContext";
import {ToastContainer} from "react-toastify";
import React from "react";

export default function App({ Component, pageProps }: AppProps) {
  return(
      <AuthProvider>
          <Component {...pageProps} />
          <ToastContainer/>
      </AuthProvider>
  );
}
