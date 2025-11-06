"use client";

import { useState, useEffect } from "react";
import styles from "./authflow.module.css";
import SignUpForm from "@/components/authflow/SignUpForm";
import SignInForm from "@/components/authflow/SignInForm";
import Button from "@components/button/Button";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

const AuthFlow = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const isMobile = useIsMobile();

  const toggleForm = () => {
    setIsSignUpActive((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      {isMobile ? (
        <>
          {isSignUpActive ? <SignUpForm /> : <SignInForm />}
          <Button
            text={
              isSignUpActive
                ? "Already have an account? Sign In"
                : "New here? Sign Up"
            }
            type="button"
            onClick={toggleForm}
            className="outline_btn"
          />
        </>
      ) : (
        <>
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
                <p>
                  Enter your personal details and start your journey with us
                </p>
                <Button text="Sign In" type="button" className="outline_btn" />
              </div>
              <div className={`${styles.toggle_panel} ${styles.toggle_right}`}>
                <h1>Hello, Friend!</h1>
                <p>Register with your personal details and get started</p>
                <Button text="Sign Up" type="button" className="outline_btn" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthFlow;
