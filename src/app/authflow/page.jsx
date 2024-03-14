"use client";

import { useState } from "react";

import styles from "@styles/authflow.module.css";
import SignUpForm from "@components/SignUpForm";
import SignInForm from "@components/SignInForm";
import Button from "@components/Button";

const AuthFlow = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);

  const toggleForm = () => {
    setIsSignUpActive((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.form_container} ${styles.sign_up} ${
          isSignUpActive ? styles.sign_up_active : ""
        }`}
      >
        <SignUpForm />
      </div>
      <div className={`${styles.form_container} ${styles.sign_in}`}>
        <SignInForm />
      </div>
      <div
        className={`${styles.toggle_container} ${
          isSignUpActive ? styles.toggle_container_active : ""
        }`}
        onClick={toggleForm}
      >
        <div
          className={`${styles.toggle} ${
            isSignUpActive ? styles.toggle_active : ""
          }`}
        >
          <div
            className={`${styles.toggle_panel} ${
              !isSignUpActive ? styles.toggle_left_active : ""
            }`}
          >
            <h1>Welcome Back!</h1>
            <p>Enter your personal details and start your journey with us</p>
            <Button text="Sign In" type="button" className="outline_btn" onClick={() => alert("Not finish")}></Button>
         
          </div>
          <div className={`${styles.toggle_panel} ${styles.toggle_right}`}>
            <h1>Hello, Friend!</h1>
            <p>Register with your personal details and get started</p>
            <Button text="Sign Up" type="button" className="outline_btn" onClick={() => alert("Not finish")}></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
