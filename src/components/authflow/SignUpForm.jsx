"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import styles from "./form.module.css";
import Button from "@components/button/Button";
import { register } from "@utils/auth-actions.js";
import { signIn } from "next-auth/react";

const SignUpForm = () => {
  const router = useRouter();
  const [errorMessage, dispatch] = useActionState(register, undefined);
  const { pending } = useFormStatus();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setGoogleError("");

    try {
      const res = await signIn("google", {
        callbackUrl: "/profile",
      });

      if (res?.error) {
        setGoogleError(res.error);
        setGoogleLoading(false);
      } else if (res?.url) {
        router.push(res.url);
      }
    } catch (err) {
      setGoogleError("Something went wrong with Google sign-in.");
      console.error("Google sign-in error:", err);
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!pending && errorMessage?.success) {
      (async () => {
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/profile",
        });
      })();
    }
  }, [pending, errorMessage, email, password, router]);

  return (
    <form action={dispatch} className={styles.sign_up_form}>
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
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <Button
        text={pending || googleLoading ? "Signing up..." : "Sign Up"}
        type="submit"
        className="black_btn"
        disabled={pending}
      ></Button>
      {errorMessage?.error && (
        <div className={styles.error_message}>{errorMessage.error}</div>
      )}
      {googleError && <div className={styles.error_message}>{googleError}</div>}
    </form>
  );
};

export default SignUpForm;
