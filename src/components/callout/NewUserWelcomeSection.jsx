"use client";

import React from "react";
import styles from "./callout.module.css";

export default function NewUserWelcomeSection() {
  return (
    <div className={styles.callout}>
      <div className={styles.calloutIcon}>👋</div>
      <div>
        <h2>Set up your Notion Sync Configuration</h2>
        To start syncing, add your <strong>Notion Database ID</strong> and
        <strong> Google Calendar Mapping</strong> in settings.
      </div>
    </div>
  );
}
