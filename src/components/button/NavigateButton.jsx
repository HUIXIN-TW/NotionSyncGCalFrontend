"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@components/button/Button";
import { ArrowLeft } from "lucide-react";

export default function NavigateButton({ path, text, className, title }) {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(path);
  };

  return (
    <Button
      text={text ? text : <ArrowLeft size={20} strokeWidth={2} />}
      onClick={handleBackClick}
      className={className}
      title={title}
    />
  );
}
