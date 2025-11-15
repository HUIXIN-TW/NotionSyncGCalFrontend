"use client";

import React from "react";
import styles from "./notioncard.module.css";
import config from "@/config/client/notion";

export default function NotionCardNoteSection({
  messages,
  templateUrl = config.NOTION_PAGE_TEMPLATE_URL,
}) {
  return (
    <>
      {messages && <div className={styles.note}>{messages}</div>}

      <div className={styles.note}>
        Don’t have a Notion page yet? You can use this template:{" "}
        <a href={templateUrl} target="_blank" rel="noopener noreferrer">
          Notion Template
        </a>
      </div>
    </>
  );
}
