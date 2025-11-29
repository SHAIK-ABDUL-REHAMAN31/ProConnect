import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "../config/redux/store";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("likedPosts");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  return (
    <>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}
