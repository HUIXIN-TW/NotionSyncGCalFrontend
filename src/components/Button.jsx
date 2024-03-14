"use client";

import styles from "@styles/button.module.css";

const Button = ({ text, onClick, type, className }) => {
  return (
    <button
      type={type} // "button", "submit", or "reset"
      className={`button ${styles[className] || styles.black_btn}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
