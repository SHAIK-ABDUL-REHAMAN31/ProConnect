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

  useEffect(() => {
    if (authState.loggedIn) router.push("/dashboard");
  }, [authState.loggedIn]);

  useEffect(() => {
    if (localStorage.getItem("token")) router.push("/dashboard");
  }, []);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [UserLoginMethod]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    const filtered = value.replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(filtered);
  };

  const handleRegister = () => {
    if (!name || !username || !email || !password) {
      alert("Please fill all fields!");
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(username.trim())) {
      alert(
        "Invalid username. Only letters, numbers, and underscores (_) allowed. No spaces or special characters."
      );
      return;
    }

    console.log("Registering...");
    dispatch(
      registerUser({ name, username: username.trim(), email, password })
    );

    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

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
              {UserLoginMethod ? "Welcome Back" : "Create Account"}
            </p>
            <p className={styles.subHeading}>
              {UserLoginMethod
                ? "Enter your details to access your account"
                : "Join our community and start connecting"}
            </p>

            <p
              className={styles.message}
              style={{ color: authState.isError ? "#ef4444" : "#10b981" }}
            >
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
                    placeholder="Full Name"
                    type="text"
                  />
                  <input
                    value={username}
                    onChange={handleUsernameChange}
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
                placeholder="Email Address"
                type="email"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder="Password"
                type="password"
              />

              <div className={styles.submitButton}>
                <button
                  onClick={() =>
                    UserLoginMethod ? handleLogin() : handleRegister()
                  }
                >
                  {UserLoginMethod ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.cardContainer_right}>
            <div className={styles.rightContent}>
              <h2>{UserLoginMethod ? "New Here?" : "Welcome Back!"}</h2>
              <p>
                {UserLoginMethod
                  ? "Sign up and discover a great amount of new opportunities!"
                  : "To keep connected with us please login with your personal info"}
              </p>
              <button
                className={styles.switchButton}
                onClick={() => setuserLoginMthod(!UserLoginMethod)}
              >
                {UserLoginMethod ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
