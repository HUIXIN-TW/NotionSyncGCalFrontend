"use client";

import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";

const Login = () => {
  return (
    <div className="container" id="container">
      <div className="form-container sign-up">
        <SignUp />
      </div>
      <div className="form-container sign-in">
        <SignIn />
      </div>
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of site features</p>
            <button className="hidden" id="login">
              Sign In
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Hello, Friend!</h1>
            <p>
              Register with your personal details to use all of site features
            </p>
            <button className="hidden" id="register">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
