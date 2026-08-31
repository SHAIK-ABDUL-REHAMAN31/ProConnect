import "@/styles/globals.css";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { store } from "../config/redux/store";
import { SocketProvider } from "../context/SocketContext";
import FullPageLoader from "@/components/FullPageLoader";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Initial mount hydration delay to prevent any UI flashing
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 450);

    const handleStart = (url) => {
      if (url !== router.asPath) {
        setPageLoading(true);
      }
    };
    const handleComplete = () => {
      setPageLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      clearTimeout(timer);
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <Provider store={store}>
      <SocketProvider>
        {(initialLoading || pageLoading) && <FullPageLoader />}
        <Component {...pageProps} />
      </SocketProvider>
    </Provider>
  );
}
