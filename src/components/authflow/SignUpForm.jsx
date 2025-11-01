"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./form.module.css";
import Button from "@components/button/Button";
import { signIn } from "next-auth/react";
import { registerAction } from "@app/api/register/actions";
import logger from "@/utils/shared/logger";

const SignUpForm = () => {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [actionState, formAction, pending] = useActionState(registerAction, {
    success: false,
    error: "",
  });

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setGoogleError("");

    try {
      const res = await signIn("google", {
        callbackUrl: "/getting-started",
      });

      if (res?.error) {
        setGoogleError(res.error);
        setGoogleLoading(false);
      } else if (res?.url) {
        router.push(res.url);
      }
    } catch (err) {
      setGoogleError("Something went wrong with Google sign-in.");
      logger.error("Google sign-in error", err);
      setGoogleLoading(false);
    }

    // after sign in, set local storage flag
    localStorage.setItem("newUser:v1", "true");
  };

  useEffect(() => {
    (async () => {
      if (actionState?.success && !pending) {
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/profile",
        });
        if (signInRes?.url) router.push(signInRes.url);
        else if (!signInRes?.error) router.push("/profile");
      }
    })();
  }, [actionState?.success, pending, email, password, router]);

  return (
    <form action={formAction} className={styles.sign_up_form}>
      <h1>Create Account</h1>
      <div className={styles.social_icons}>
        <a
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading || pending}
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
      <span>or use your email for registration</span>
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password again"
        name="passwordRepeat"
        value={passwordRepeat}
        onChange={(e) => setPasswordRepeat(e.target.value)}
      />
      <p>
        By signing up, you agree to our{" "}
        <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>
      <Button
        text={pending || googleLoading ? "Signing up..." : "Sign Up"}
        type="submit"
        className="black_btn"
        disabled={pending || googleLoading}
      ></Button>
      {actionState?.error && (
        <div className={styles.error_message}>{actionState.error}</div>
      )}
      {googleError && <div className={styles.error_message}>{googleError}</div>}
    </form>
  );
};

export default SignUpForm;
