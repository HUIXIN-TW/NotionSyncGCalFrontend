"use client";

import styles from "./button.module.css";

const Button = ({
  text,
  onClick,
  type = "button", // default to "button"
  className = "",
  disabled,
  title,
}) => {
  return (
    <button
      type={type} // "button", "submit", or "reset"
      className={`button ${styles[className] || styles.black_btn}`}
      onClick={onClick}
      disabled={disabled}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      title={title}
    >
      {text}
    </button>
  );
};

export default Button;
