import React from "react";
import Button from "@components/button/Button";

export default function EditButton({ setEditMode }) {
  const handleEditClick = () => setEditMode(true);

  return <Button text="Edit Configuration" onClick={handleEditClick} />;
}
