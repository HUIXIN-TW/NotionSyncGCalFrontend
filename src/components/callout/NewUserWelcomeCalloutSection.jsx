"use client";

import React from "react";
import styles from "./callout.module.css";

export default function NewUserWelcomeCalloutSection() {
  return (
    <div className={styles.callout}>
      <div className={styles.calloutIcon}>👋</div>
      <div>
        <h2>Set up your Notion Sync Configuration</h2>
        To start syncing, add your <strong>
          Basic - Notion Database ID
        </strong>{" "}
        and
        <strong> GCal - Google Calendar Mapping</strong>.
      </div>
    </div>
  );
}
