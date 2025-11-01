"use client";

import React from "react";
import Button from "@components/button/Button";
import styles from "./notioncard.module.css";
import NavigateButton from "@/components/button/NavigateButton";
import EditButton from "@components/button/EditButton";
import CancelButton from "@components/button/CancelButton";

export default function NotionTabs({
  onChange,
  value,
  editMode,
  setEditMode,
  setEditableConfig,
}) {
  const tabs = [
    { value: "basic", label: "Basic" },
    { value: "gcal", label: "GCal" },
    { value: "page", label: "Notion" },
  ];
  return (
    <div role="tablist" className={styles.tabs_list}>
      <NavigateButton path="/profile" className="clear_btn" />
      {tabs.map((t) => (
        <Button
          key={t.value}
          text={t.label}
          onClick={() => onChange(t.value)}
          className={value === t.value ? "tab_btn_active" : "tab_btn"}
        />
      ))}
      {editMode ? (
        <CancelButton
          setEditableConfig={setEditableConfig}
          setEditMode={setEditMode}
        />
      ) : (
        <EditButton setEditMode={setEditMode} />
      )}
    </div>
  );
}
