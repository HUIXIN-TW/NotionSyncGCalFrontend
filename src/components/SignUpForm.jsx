"use client";

import styles from "@styles/authflow.module.css";
import Button from "@components/Button";

const SignUpForm = () => {
  return (
    <form>
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
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <Button text="Sign Up" type="button" className="balck_btn" onClick={() => alert("Not finish")}></Button>
    </form>
  );
};

export default SignUpForm;
