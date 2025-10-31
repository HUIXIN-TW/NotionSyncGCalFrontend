"use client";

import React from "react";
import Button from "@components/button/Button";

export default function CancelButton({ setEditableConfig, setEditMode }) {
  const handleCancelClick = () => {
    const local = localStorage.getItem("notionConfig");
    if (local) {
      try {
        setEditableConfig(JSON.parse(local));
      } catch {
        console.error("Invalid local config JSON");
      }
    }
    setEditMode(false);
  };

  return <Button text="Cancel" onClick={handleCancelClick} />;
}
