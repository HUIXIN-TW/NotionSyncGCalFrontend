"use client";

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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from causing a page reload

    // Attempt to sign in using the credentials
    const result = await signIn("credentials", {
      redirect: false, // Prevent redirect to avoid losing state in case of error
      email: email,
      password: password,
    });

    // Handle sign-in result
    if (result.error) {
      setErrorMessage(result.error);
      console.error("Sign in failed:", result.error);
    } else {
      console.log("Sign in successful!");
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
        <a href="#">
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
        aria-label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        aria-label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <a href="#">Forget Your Password?</a>
      {errorMessage && <div className="error_message">{errorMessage}</div>}
      <Button text="Sign In" type="submit" className="black_btn"></Button>
    </form>
  );
};

export default SignInForm;
