"use client";

import React from "react";
import styles from "./callout.module.css";
import SignOutButton from "@components/button/SignOutButton";

export default function NewUserSignOutCalloutSection() {
  return (
    <>
      <SignOutButton text="Finish Setup & Re-Authenticate" />
      <div className={styles.callout}>
        <div className={styles.calloutIcon}>✅</div>
        <div>
          <h2>Setup Complete</h2>
          After saving, use the <strong>
            Finish Setup & Re-Authenticate
          </strong>{" "}
          to complete the authorization process.
        </div>
      </div>
    </>
  );
}
