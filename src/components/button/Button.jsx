"use client";

import styles from "./button.module.css";

const Button = ({
  text,
  onClick,
  type = "button",
  className = "",
  disabled,
}) => {
  return (
    <button
      type={type} // "button", "submit", or "reset"
      className={`button ${styles[className] || styles.black_btn}`}
      onClick={onClick}
      disabled={disabled}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {text}
    </button>
  );
};

export default Button;
