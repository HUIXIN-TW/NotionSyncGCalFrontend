"use client";

import { useFormState } from "react-dom";

import styles from "./form.module.css";
import Button from "@components/button/Button";

const SignInForm = () => {
  return (
    <form className={styles.sign_in_form}>
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
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <a href="#">Forget Your Password?</a>
      <Button text="Sign In" type="submit" className="black_btn"></Button>
    </form>
  );
};

export default SignInForm;
