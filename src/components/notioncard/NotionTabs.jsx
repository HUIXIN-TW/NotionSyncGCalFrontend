"use client";

import React from "react";
import Button from "@components/button/Button";
import styles from "./notioncard.module.css";

export default function NotionTabs({ tabs, onChange }) {
  return (
    <div role="tablist" className={styles.tabs_list}>
      {tabs.map((t) => (
        <Button
          key={t.value}
          text={t.label}
          onClick={() => onChange(t.value)}
          className="tab_btn"
        />
      ))}
    </div>
  );
}
