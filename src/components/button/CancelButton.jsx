"use client";

import React from "react";
import Button from "@components/button/Button";
import { X } from "lucide-react";

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

  return (
    <Button
      text={<X size={16} strokeWidth={2} />}
      className="clear_btn"
      onClick={handleCancelClick}
    />
  );
}
