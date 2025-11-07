"use client";

import React from "react";
import styles from "./notioncard.module.css";
import config from "@/config/notion";

export default function NotionCardNoteSection({
  lastFetchedAt,
  lastModifiedAt,
  templateUrl = config.NOTION_PAGE_TEMPLATE_URL,
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
