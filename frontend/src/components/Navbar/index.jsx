import React from "react";
import styles from "./navStyles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducre/authReducer";

export default function NavrBarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  return (
    <>
      <div style={styles.container}>
        <div className={styles.navbar}>
          <h1
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push("/");
            }}
          >
            ProConnect
          </h1>
          <div className={styles.navbarOptionsContainer}>
            {authState.profileFetched && (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "1.2rem",
                    paddingRight: "1rem",
                  }}
                >
                  {/* <p
                    onClick={() => {
                      router.push("/profile");
                    }}
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    Profile
                  </p> */}

                  <button
                    onClick={() => {
                      router.push("/profile");
                    }}
                    className={styles.acceptButton}
                  >
                    View Profile
                  </button>

                  <p
                    className={styles.LogOutButton}
                    onClick={() => {
                      localStorage.removeItem("token");
                      router.push("/login");
                      dispatch(reset());
                    }}
                    style={{
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
            {!authState.profileFetched && (
              <div
                onClick={() => {
                  router.push("/login");
                }}
                className={styles.buttonClass}
              >
                <p className="join Now ">Join Now</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
