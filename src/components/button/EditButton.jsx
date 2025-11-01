import React from "react";
import Button from "@components/button/Button";
import { Pencil } from "lucide-react";

export default function EditButton({ setEditMode }) {
  const handleEditClick = () => setEditMode(true);

  return (
    <Button
      text={
        <>
          <Pencil size={16} strokeWidth={2} style={{ marginRight: 6 }} />
        </>
      }
      className="clear_btn"
      onClick={handleEditClick}
    />
  );
}
