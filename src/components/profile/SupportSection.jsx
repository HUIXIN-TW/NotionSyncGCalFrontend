"use client";

import styles from "./profile.module.css";

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/huixinyang";
const BUY_ME_A_COFFEE_IMAGE =
  "https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png";

export default function SupportSection() {
  return (
    <div className={styles.support_section}>
      <span className={styles.note}>Enjoying NOTICA? Support me:</span>
      <a
        href={BUY_ME_A_COFFEE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.profile_bmac_button}
      >
        <img
          src={BUY_ME_A_COFFEE_IMAGE}
          alt="Buy Me a Coffee"
          style={{
            height: "36px",
            width: "130px",
            marginTop: "0.25rem",
            borderRadius: "6px",
            boxShadow: "0 0 4px rgba(0,0,0,0.1)",
          }}
        />
      </a>
    </div>
  );
}
