"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@components/button/Button";

export default function NavigateButton({ path, text, className, title }) {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(path);
  };

  return (
    <Button
      text={text}
      onClick={handleBackClick}
      className={className}
      title={title}
    />
  );
}
