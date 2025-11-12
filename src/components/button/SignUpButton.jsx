"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Button from "@components/button/Button";
import {
  buildSignInUrl,
  isEmbedded,
  openAuthWindow,
} from "@/utils/client/embed-context";
import logger from "@/utils/shared/logger";

export default function SignUpButton() {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);

    const callbackUrl = "/getting-started";

    if (isEmbedded()) {
      openAuthWindow(buildSignInUrl(callbackUrl));
      setGoogleLoading(false);
    } else {
      try {
        await signIn("google", { callbackUrl });
      } catch (err) {
        alert(`Google sign-in exception: ${err}`);
        logger.error("Google sign-in error", err);
      } finally {
        setGoogleLoading(false);
      }
    }

    localStorage.setItem("newUser:v1", "true");
  };

  return (
    <Button
      text="Sign up with Google"
      onClick={handleGoogleSignup}
      disabled={googleLoading}
    />
  );
}
