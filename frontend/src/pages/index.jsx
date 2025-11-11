import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import UserLayout from "@/layout/UserLayout";
import { Router, useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });
export default function Home() {
  const router = useRouter();
  return (
    <UserLayout>
      <div className={styles.container}>
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <h1>
              Connect With Friends <span>Without Exaggeration</span>
            </h1>
            <p>
              Experience ProConnect built for authenticity — no filters, no
              exaggeration, just genuine stories from real people.
            </p>
            <button
              className={styles.joinButton}
              onClick={() => router.push("/login")}
            >
              Join Now
            </button>
          </div>

          <div className={styles.heroRight}>
            <img
              style={{ display: "block" }}
              src="images/illustration.png"
              alt="social illustration"
              className={styles.heroImage}
            />
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2>Why Choose Us?</h2>
          <div className={styles.cardContainer}>
            <div className={styles.card}>
              <img src="images\landingPageImage3.jpeg" alt="Connect" />
              <h3>Real Connections</h3>
              <p>Meet people who share your interests — no fake personas.</p>
            </div>
            <div className={styles.card}>
              <img src="images\landingpage image1.jpeg" alt="Story" />
              <h3>True Stories</h3>
              <p>
                Share your moments with your circle in a judgment-free space.
              </p>
            </div>
            <div className={styles.card}>
              <img src="\images\landingpage image2.jpeg" alt="Privacy" />
              <h3>Private & Secure</h3>
              <p>Your data, your control. We protect your privacy 24/7.</p>
            </div>
          </div>
        </section>

        <section className={styles.communitySection}>
          <div className={styles.communityText}>
            <h2>Join a Growing Community</h2>
            <p>
              Become part of a social media revolution that values honesty and
              human connection. Thousands have already joined the movement —
              will you?
            </p>
            <button
              className={styles.exploreButton}
              onClick={() => router.push("/discover")}
            >
              Explore Now
            </button>
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
