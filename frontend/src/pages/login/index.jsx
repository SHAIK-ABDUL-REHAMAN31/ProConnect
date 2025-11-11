import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducre/authReducer";

export default function LoginComponent() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  const [UserLoginMethod, setuserLoginMthod] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // ✅ Redirect when logged in
  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, []);

  // ✅ Clear auth message when toggling between Sign In / Up
  useEffect(() => {
    dispatch(emptyMessage());
  }, [UserLoginMethod]);

  // ✅ Handle registration
  const handleRegister = () => {
    if (!name || !username || !email || !password) {
      alert("Please fill all fields!");
      return;
    }

    console.log("Registering...");
    dispatch(registerUser({ name, username, email, password }));

    // ✅ Clear inputs after successful registration
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  // ✅ Handle login
  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill all fields!");
      return;
    }

    console.log("Logging in...");
    dispatch(loginUser({ email, password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <p className={styles.cardLeftHeading}>
              {UserLoginMethod ? "Sign in" : "Sign Up"}
            </p>

            <p style={{ color: authState.isError ? "red" : "green" }}>
              {typeof authState.message === "object"
                ? authState.message?.message
                : authState.message}
            </p>

            <div className={styles.inputContainers}>
              {!UserLoginMethod && (
                <div className={styles.inputRow1}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.inputField}
                    placeholder="Name"
                    type="text"
                  />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.inputField}
                    placeholder="Username"
                    type="text"
                  />
                </div>
              )}

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                placeholder="Email"
                type="text"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder="Password"
                type="password"
              />

              <div className={styles.submitButton}>
                <p
                  onClick={() => {
                    if (UserLoginMethod) {
                      handleLogin();
                    } else {
                      handleRegister();
                    }
                  }}
                >
                  {UserLoginMethod ? "Sign in" : "Sign Up"}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.cardContainer_right}>
            <div>
              <p>
                {UserLoginMethod
                  ? "Don't Have An Account?"
                  : "Already have an account?"}
              </p>
              <br />
              <div
                style={{ background: "white", borderRadius: "10px" }}
                className={styles.submitButton}
              >
                <p
                  style={{ background: "white", color: "black" }}
                  onClick={() => {
                    setuserLoginMthod(!UserLoginMethod);
                  }}
                >
                  {UserLoginMethod ? "Sign Up" : "Sign In"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
