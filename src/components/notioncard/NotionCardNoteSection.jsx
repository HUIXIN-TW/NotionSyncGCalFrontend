"use client";

import React from "react";
import styles from "./notioncard.module.css";

export default function NotionCardNoteSection({
  lastFetchedAt,
  lastModifiedAt,
  templateUrl = "https://panoramic-law-7f5.notion.site/2a4438de0d8881729bd2e5143d116387?v=2a4438de0d888100a2ae000c0cae990e",
}) {
  return (
    <>
      <div className={styles.note}>
        Last fetched from S3: {lastFetchedAt || "-"}
      </div>

      <div className={styles.note}>
        Last modified in S3: {lastModifiedAt || "-"}
      </div>

      <div className={styles.note}>
        Don’t have a Notion page yet? You can use this template:{" "}
        <a href={templateUrl} target="_blank" rel="noopener noreferrer">
          Notion Template
        </a>
      </div>
    </>
  );
}
