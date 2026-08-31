import React from "react";
import styles from "./FullPageLoader.module.css";

export default function FullPageLoader({ text }) {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderContent}>
        {/* Brand Logo */}
        <div className={styles.brandLogo}>
          <span className={styles.brandPro}>pro</span>
          <span className={styles.brandConnect}>Connect</span>
          <span className={styles.brandDot}></span>
        </div>

        {/* Sleek Animated Progress Bar Directly Under Text */}
        <div className={styles.pulseBar}>
          <div className={styles.pulseBarFill}></div>
        </div>

        {text && <p className={styles.loaderSubtitle}>{text}</p>}
      </div>
    </div>
  );
}
