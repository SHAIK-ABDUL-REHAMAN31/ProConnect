import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <Head>
        <title>ProConnect | Authentic Professional Networking</title>
        <meta
          name="description"
          content="Connect with professionals authentically. No filters, just real stories."
        />
      </Head>

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <span className={styles.badge}>🚀 The Future of Networking</span>
            <h1>
              Connect With Friends <br />
              <span>Without Exaggeration</span>
            </h1>
            <p>
              Experience ProConnect built for authenticity — no filters, no
              exaggeration, just genuine stories from real people. Join a
              community that values truth over trends.
            </p>
            <div className={styles.ctaGroup}>
              <button
                className={styles.primaryButton}
                onClick={() => router.push("/login")}
              >
                Get Started
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => router.push("/")}
              >
                Learn More
              </button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <img
              src="/images/illustration.png"
              alt="Social networking illustration"
              className={styles.heroImage}
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statItem}>
            <h3>10k+</h3>
            <p>Active Users</p>
          </div>
          <div className={styles.statItem}>
            <h3>500+</h3>
            <p>Communities</p>
          </div>
          <div className={styles.statItem}>
            <h3>100%</h3>
            <p>Verified Profiles</p>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2>Why Choose ProConnect?</h2>
            <p>
              We're redefining how professionals connect online. No noise, just
              value.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>🤝</div>
              <h3>Real Connections</h3>
              <p>
                Meet people who share your interests and professional goals — no
                fake personas or vanity metrics.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>📖</div>
              <h3>True Stories</h3>
              <p>
                Share your professional journey and moments with your circle in
                a judgment-free space.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>🔒</div>
              <h3>Private & Secure</h3>
              <p>
                Your data, your control. We protect your privacy 24/7 with
                enterprise-grade security.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <div className={styles.ctaContent}>
              <h2>Ready to Join the Revolution?</h2>
              <p>
                Become part of a social media revolution that values honesty and
                human connection. Thousands have already joined.
              </p>
              <button
                className={styles.whiteButton}
                onClick={() => router.push("/discover")}
              >
                Explore Now
              </button>
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
