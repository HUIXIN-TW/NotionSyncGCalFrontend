"use client";
import Button from "@components/button/Button";
import { CloudDownload } from "lucide-react";
import { useNotionConfig } from "@/hooks/useNotionConfig";

const LoadButton = ({ text }) => {
  const { reload, loading } = useNotionConfig();

  return (
    <Button
      text={text ? text : <CloudDownload size={16} strokeWidth={2} />}
      className="clear_btn"
      onClick={reload}
      disabled={loading}
    />
  );
};

export default LoadButton;
