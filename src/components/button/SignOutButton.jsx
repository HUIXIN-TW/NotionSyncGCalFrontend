"use client";
import React from "react";
import { signOut } from "next-auth/react";
import logger from "@utils/shared/logger";
import Button from "@components/button/Button";

const SignOutButton = ({ className, style, text = "Sign Out", title }) => {
  const handleSignOut = async () => {
    try {
      localStorage.clear(); // Clear all localStorage on sign-out
      logger.info("LocalStorage cleared on sign-out");
    } catch (e) {
      logger.warn("Failed to clear localStorage", e);
    }

    await signOut({ callbackUrl: "/" }); // NextAuth sign-out
  };

  return (
    <Button
      text={text}
      onClick={handleSignOut}
      className={className}
      style={style}
      title={title}
    />
  );
};

export default SignOutButton;
