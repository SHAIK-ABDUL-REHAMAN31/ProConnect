import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import {
  loginUser,
  registerUser,
  googleLoginUser,
} from "@/config/redux/action/userAction";
import { emptyMessage } from "@/config/redux/reducre/userReducer";
import { api } from "@/services/apiClient";

export default function LoginComponent() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  const [UserLoginMethod, setuserLoginMthod] = useState(false); // false = Register, true = Login
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Real-time Username Verification State
  const [usernameStatus, setUsernameStatus] = useState(null); // { isValid: boolean, message: string }
  const [usernameLoading, setUsernameLoading] = useState(false);

  // DNS Real-world Email Verification State
  const [dnsStatus, setDnsStatus] = useState(null);
  const [dnsLoading, setDnsLoading] = useState(false);

  // Nodemailer OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    dispatch(emptyMessage());
    setDnsStatus(null);
    setUsernameStatus(null);
    setUsernameLoading(false);
    setOtpError("");
    setOtpSuccess("");
  }, [UserLoginMethod]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    const handleGoogleCallback = (response) => {
      if (response && response.credential) {
        dispatch(googleLoginUser({ credential: response.credential }));
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "714806757208-uc3qsmu0050pjka7m9mtldl2mheud16m.apps.googleusercontent.com";

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnContainer = document.getElementById("google-btn-rendered");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
          });
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [UserLoginMethod, dispatch]);

  // Real-time DNS Domain Verification with Debounce
  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setDnsStatus(null);
      setDnsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setDnsLoading(true);
      try {
        const response = await api.checkEmailDns(trimmed);
        const data = response.data?.data || response.data;
        setDnsStatus(data);
      } catch (err) {
        setDnsStatus({
          isValid: false,
          reason:
            err.response?.data?.message ||
            "Unable to verify domain DNS at this time.",
        });
      } finally {
        setDnsLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [email]);

  const handleUsernameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(value);
  };

  // Real-time Debounced Username Check with AbortController
  useEffect(() => {
    if (UserLoginMethod) {
      setUsernameStatus(null);
      setUsernameLoading(false);
      return;
    }

    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setUsernameStatus(null);
      setUsernameLoading(false);
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus({
        isValid: false,
        message: "Username must be at least 3 characters",
      });
      setUsernameLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      setUsernameStatus({
        isValid: false,
        message: "Only letters, numbers, and _ allowed (max 20 chars)",
      });
      setUsernameLoading(false);
      return;
    }

    setUsernameLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await api.checkUsername(trimmed, {
          signal: controller.signal,
        });
        const data = response.data?.data || response.data;
        setUsernameStatus({
          isValid: Boolean(data?.available),
          message:
            data?.message ||
            (data?.available ? "Username available" : "Username already exists"),
        });
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setUsernameStatus({
            isValid: false,
            message:
              err.response?.data?.message || "Username already exists",
          });
        }
      } finally {
        setUsernameLoading(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username, UserLoginMethod]);

  // Real-time Password Validation and Strength
  const passwordStatus = useMemo(() => {
    if (UserLoginMethod || !password) return null;
    const len = password.length;
    if (len < 6) {
      return {
        isValid: false,
        strength: "weak",
        message: "Password must be at least 6 characters",
      };
    }
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (len >= 8 && hasLetters && (hasNumbers || hasSpecial)) {
      return {
        isValid: true,
        strength: "strong",
        message: "Strong password ✓",
      };
    }
    return {
      isValid: true,
      strength: "good",
      message: "Valid password ✓",
    };
  }, [password, UserLoginMethod]);

  const triggerGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      alert("Google Sign-In is initializing. Please wait a moment.");
    }
  };

  // Step 1: Submit Form & Send Nodemailer OTP
  const handleInitiateRegister = async () => {
    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!username.trim()) {
      alert("Please enter a username.");
      return;
    }
    if (usernameStatus && !usernameStatus.isValid) {
      alert(usernameStatus.message || "Please choose an available username.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (dnsStatus && !dnsStatus.isValid) {
      alert(dnsStatus.reason || "Please provide a valid, active email address.");
      return;
    }
    if (!passwordStatus || !passwordStatus.isValid) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setOtpSending(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const response = await api.sendEmailOtp({
        email: email.trim(),
        name: name.trim() || username.trim(),
      });

      setOtpDigits(["", "", "", "", "", ""]);
      setOtpSuccess(
        response.data?.message ||
        `Verification code sent to ${email.trim()}!`
      );
      setShowOtpModal(true);
      setResendCooldown(60);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 250);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to send verification code. Please check your email."
      );
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: Validate 6-Digit OTP & Complete Registration
  const handleVerifyOtpAndRegister = async () => {
    const code = otpDigits.join("").trim();
    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");

    try {
      // 1. Verify 6-digit OTP with backend
      await api.verifyEmailOtp({
        email: email.trim(),
        otp: code,
      });

      setOtpSuccess("Email verified! Creating your account...");

      // 2. Complete registration and grant immediate access & permissions
      const registerResult = await dispatch(
        registerUser({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        })
      );

      if (registerUser.fulfilled.match(registerResult)) {
        setShowOtpModal(false);
        // Redux state.auth.loggedIn is true -> useEffect automatically redirects to "/"
      } else {
        setOtpError(
          typeof registerResult.payload === "string"
            ? registerResult.payload
            : registerResult.payload?.message ||
            "Registration failed. Please try again."
        );
      }
    } catch (error) {
      setOtpError(
        error.response?.data?.message ||
        "Invalid or expired verification code. Please try again."
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  // OTP single digit handler
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerifyOtpAndRegister();
    }
  };

  // Paste handler for 6 digits
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .trim()
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      const arr = pasted.split("");
      while (arr.length < 6) arr.push("");
      setOtpDigits(arr);
      const focusIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Traditional Login
  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter your email/username and password.");
      return;
    }

    dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          {/* Left Side: Auth Forms */}
          <div className={styles.cardContainer_left}>
            <h1 className={styles.cardLeftHeading}>
              {UserLoginMethod ? "Welcome Back" : "Join ProConnect"}
            </h1>
            <p className={styles.subHeading}>
              {UserLoginMethod
                ? "Sign in to access your professional network and career opportunities."
                : "Create an account to connect with top tech professionals and recruiters."}
            </p>

            {/* Google Sign-In Area */}
            <div className={styles.googleBtnContainer}>
              <div id="google-btn-rendered" style={{ minHeight: "44px" }}></div>
              <noscript>
                <button
                  type="button"
                  className={styles.googleBtn}
                  onClick={triggerGoogleSignIn}
                >
                  <svg
                    className={styles.googleIcon}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </noscript>
            </div>

            <div className={styles.divider}>or continue with email</div>

            {/* Server & Client Messages */}
            {authState.message && (
              <div
                className={styles.message}
                style={{
                  color: authState.isError ? "#f87171" : "#34d399",
                  borderColor: authState.isError ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)",
                }}
              >
                <span>{authState.isError ? "⚠️" : "✓"}</span>
                <span>
                  {typeof authState.message === "object"
                    ? authState.message?.message || JSON.stringify(authState.message)
                    : authState.message}
                </span>
              </div>
            )}
            <div className={styles.inputContainers}>
              {!UserLoginMethod && (
                <div className={styles.inputRow1}>
                  <div className={styles.inputFieldWrapper}>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.inputField}
                      placeholder="Full Name"
                      type="text"
                      autoComplete="name"
                    />
                  </div>
                  <div className={styles.inputFieldWrapper}>
                    <input
                      value={username}
                      onChange={handleUsernameChange}
                      className={`${styles.inputField} ${usernameStatus?.isValid === true
                          ? styles.inputFieldValid
                          : usernameStatus && !usernameStatus.isValid
                            ? styles.inputFieldInvalid
                            : ""
                        }`}
                      placeholder="Username"
                      type="text"
                      autoComplete="username"
                    />

                    {/* Real-time Debounced Username Status Badge */}
                    {usernameLoading && (
                      <span
                        className={`${styles.statusBadge} ${styles.statusChecking}`}
                      >
                        <span>⏳</span> Checking availability...
                      </span>
                    )}

                    {!usernameLoading && usernameStatus?.isValid === true && (
                      <span
                        className={`${styles.statusBadge} ${styles.statusValid}`}
                      >
                        <span>✓</span> @{username} is available
                      </span>
                    )}

                    {!usernameLoading &&
                      usernameStatus &&
                      !usernameStatus.isValid && (
                        <span
                          className={`${styles.statusBadge} ${styles.statusInvalid}`}
                        >
                          <span>✕</span> {usernameStatus.message}
                        </span>
                      )}
                  </div>
                </div>
              )}

              <div className={styles.inputFieldWrapper}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${styles.inputField} ${!UserLoginMethod && dnsStatus?.isValid === true
                      ? styles.inputFieldValid
                      : !UserLoginMethod && dnsStatus && !dnsStatus.isValid
                        ? styles.inputFieldInvalid
                        : ""
                    }`}
                  placeholder={
                    UserLoginMethod
                      ? "Email Address or Username"
                      : "Corporate / Personal Email"
                  }
                  type={UserLoginMethod ? "text" : "email"}
                  autoComplete={UserLoginMethod ? "username" : "email"}
                />

                {/* Real-time DNS Domain Status Badge */}
                {!UserLoginMethod && email.includes("@") && (
                  <div style={{ marginTop: "4px" }}>
                    {dnsLoading && (
                      <span
                        className={`${styles.dnsBadge} ${styles.dnsChecking}`}
                      >
                        <span>⏳</span> Checking real-world domain mail servers...
                      </span>
                    )}

                    {!dnsLoading && dnsStatus?.isValid && (
                      <span
                        className={`${styles.dnsBadge} ${styles.dnsValid}`}
                      >
                        <span>✓</span> Active mail server detected: @{dnsStatus.domain}
                        {dnsStatus.primaryMx && ` (${dnsStatus.primaryMx.split(".")[0]})`}
                      </span>
                    )}

                    {!dnsLoading && dnsStatus && !dnsStatus.isValid && (
                      <span
                        className={`${styles.dnsBadge} ${styles.dnsInvalid}`}
                      >
                        <span>✕</span> {dnsStatus.reason}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.inputFieldWrapper}>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.inputField} ${!UserLoginMethod && passwordStatus?.isValid === true
                      ? styles.inputFieldValid
                      : !UserLoginMethod && passwordStatus && !passwordStatus.isValid
                        ? styles.inputFieldInvalid
                        : ""
                    }`}
                  placeholder="Password"
                  type="password"
                  autoComplete={UserLoginMethod ? "current-password" : "new-password"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      UserLoginMethod ? handleLogin() : handleInitiateRegister();
                    }
                  }}
                />

                {/* Real-time Password Strength & Criteria Feedback */}
                {!UserLoginMethod && passwordStatus && (
                  <div style={{ marginTop: "4px" }}>
                    <span
                      className={`${styles.statusBadge} ${passwordStatus.isValid
                          ? styles.statusValid
                          : styles.statusInvalid
                        }`}
                    >
                      <span>{passwordStatus.isValid ? "✓" : "✕"}</span>{" "}
                      {passwordStatus.message}
                    </span>

                    <div className={styles.passwordStrengthBar}>
                      <div
                        className={`${styles.passwordStrengthFill} ${passwordStatus.strength === "weak"
                            ? styles.strengthWeak
                            : passwordStatus.strength === "good"
                              ? styles.strengthGood
                              : styles.strengthStrong
                          }`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.submitButton}>
                <button
                  type="button"
                  onClick={UserLoginMethod ? handleLogin : handleInitiateRegister}
                  disabled={authState.isLoading || otpSending}
                >
                  {otpSending
                    ? "Sending Verification Code..."
                    : authState.isLoading
                      ? "Authenticating..."
                      : UserLoginMethod
                        ? "Sign In to Account"
                        : "Create ProConnect Account"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Visual Switch & Platform Highlights */}
          <div className={styles.cardContainer_right}>
            <div className={styles.rightContent}>
              <h2>{UserLoginMethod ? "New to ProConnect?" : "Already a Member?"}</h2>
              <p>
                {UserLoginMethod
                  ? "Join 100,000+ developers, tech leaders, and recruiters building careers and sharing engineering insights."
                  : "Welcome back! Keep your professional presence updated, message your network, and apply for verified roles."}
              </p>

              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <span>⚡</span> Real-time DNS verified communication
                </div>
                <div className={styles.featureItem}>
                  <span>🔒</span> Google Single Sign-On & JWT security
                </div>
                <div className={styles.featureItem}>
                  <span>🌐</span> WebSocket live messaging & notifications
                </div>
              </div>

              <button
                type="button"
                className={styles.switchButton}
                onClick={() => setuserLoginMthod(!UserLoginMethod)}
              >
                {UserLoginMethod ? "Create Free Account" : "Sign In to Account"}
              </button>
            </div>
          </div>
        </div>

        {/* 6-Digit Nodemailer OTP Verification Modal */}
        {showOtpModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalIcon}>✉️</div>
              <h3 className={styles.modalTitle}>Verify Email Address</h3>
              <p className={styles.modalSubtitle}>
                We sent a 6-digit verification code to <strong>{email}</strong>.
                Enter the code below to complete registration and access ProConnect.
              </p>

              {otpError && (
                <div
                  className={styles.message}
                  style={{ color: "#f87171", marginBottom: "1rem" }}
                >
                  ⚠️ {otpError}
                </div>
              )}

              {otpSuccess && (
                <div
                  className={styles.message}
                  style={{ color: "#34d399", marginBottom: "1rem" }}
                >
                  ✓ {otpSuccess}
                </div>
              )}

              <div
                className={styles.otpInputsContainer}
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={styles.otpSingleInput}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.verifyModalBtn}
                  onClick={handleVerifyOtpAndRegister}
                  disabled={otpVerifying}
                >
                  {otpVerifying ? "Verifying & Creating Account..." : "Verify & Access Account"}
                </button>

                <button
                  type="button"
                  className={styles.cancelModalBtn}
                  onClick={handleInitiateRegister}
                  disabled={resendCooldown > 0 || otpSending}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't receive code? Resend"}
                </button>

                <button
                  type="button"
                  className={styles.cancelModalBtn}
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
