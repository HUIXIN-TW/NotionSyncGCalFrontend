"use client";

import React, { useState } from "react";
import { useConnectionNotice } from "@/hooks/useConnectionNotice";
import styles from "./notioncard.module.css";

export default function NotionCardNoteSection({
  lastFetchedAt,
  lastModifiedAt,
  templateUrl = "https://www.notion.so/28b438de0d88819db5f6c28a33ccbfdc?v=28b438de0d8881158789000cba8aab6f",
}) {
  const [notice, setNotice] = useState(null);
  useConnectionNotice(setNotice);

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

      {notice && <span className={styles.note}>{notice}</span>}
    </>
  );
}
