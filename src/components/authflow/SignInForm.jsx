import logger from "@utils/logger";
("use client");

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

import styles from "./form.module.css";
import Button from "@components/button/Button";

const SignInForm = () => {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/profile",
    });

    setLoading(false);

    if (result?.error) {
      setErrorMessage(result.error);
      logger.error("Sign in failed", result.error);
    } else if (result?.url) {
      logger.info("Sign in successful, redirecting to:", result.url);
      router.push(result.url);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setGoogleError("");

    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/profile",
      });

      if (result?.error) {
        setGoogleError("Google sign-in failed. Please try again.");
        logger.error("Google sign-in error", result.error);
        setLoading(false);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setGoogleError("Something went wrong with Google sign-in.");
      logger.error("Google sign-in exception", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile");
    }
  }, [status, router]);

  return (
    <form onSubmit={handleSubmit} className={styles.sign_in_form}>
      <h1>Sign In</h1>
      <div className={styles.social_icons}>
        <a
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className={styles.social_btn}
        >
          <i className="fa-brands fa-google-plus-g"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-facebook-f"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-github"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-linkedin-in"></i>
        </a>
      </div>
      <span>or use your email password</span>
      <input
        type="email"
        placeholder="Email"
        name="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        name="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <a href="#">Forgot your password?</a>
      {errorMessage && (
        <div className={styles.error_message}>{errorMessage}</div>
      )}
      {googleError && <div className={styles.error_message}>{googleError}</div>}

      <Button
        text={loading ? "Signing In..." : "Sign In"}
        type="submit"
        className="black_btn"
        disabled={loading}
      />
    </form>
  );
};

export default SignInForm;
