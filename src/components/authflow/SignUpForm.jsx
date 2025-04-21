"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";

import styles from "./form.module.css";
import Button from "@components/button/Button";
import { register } from "@utils/auth-actions.js";

const SignUpForm = () => {
  const [errorMessage, dispatch] = useFormState(register, undefined);
  const { pending } = useFormStatus();
  const router = useRouter();

  useEffect(() => {
    if (!pending && errorMessage?.success) {
      router.push("/");
    }
  }, [pending, errorMessage, router]);

  return (
    <form action={dispatch} className={styles.sign_up_form}>
      <h1>Create Account</h1>
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
      <span>or use your email for registration</span>
      <input type="email" placeholder="Email" name="email" />
      <input type="password" placeholder="Password" name="password" />
      <input
        type="password"
        placeholder="password again"
        name="passwordRepeat"
      />
      <Button
        text="Sign Up"
        type="submit"
        className="black_btn"
        disabled={pending}
      ></Button>
      {errorMessage && (
        <div className={styles.error_message}>{errorMessage.error}</div>
      )}
    </form>
  );
};

export default SignUpForm;
