"use client";

import styles from "@styles/authflow.module.css";
import Button from "@components/Button";

const SignInForm = () => {
  return (
    <form>
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
      <Button text="Sign In" type="button" className="black_btn" onClick={() => alert("Not finish")}></Button>
    </form>
  );
};

export default SignInForm;
