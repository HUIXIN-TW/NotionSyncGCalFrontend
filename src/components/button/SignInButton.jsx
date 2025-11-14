"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Button from "@components/button/Button";
import {
  buildSignInUrl,
  isEmbedded,
  openAuthWindow,
} from "@utils/client/embed-context";
import logger from "@utils/shared/logger";

export default function SignInButton({
  className,
  style,
  text = "Continue with Google",
  title = "Sign in with Google",
}) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const callbackUrl = "/profile";

    // Use popup for OAuth inside iframe to avoid fetch being blocked by Google.
    if (isEmbedded()) {
      openAuthWindow(buildSignInUrl(callbackUrl));
      setLoading(false);
      return;
    }

    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      logger.error("Google sign-in exception", err);
      alert(`Google sign-in exception: ${err}`);
      setLoading(false);
    }
  };

  return (
    <Button
      text={loading ? "Sign In..." : text}
      onClick={handleGoogleLogin}
      disabled={loading}
      className={className}
      style={style}
      title={title}
    />
  );
}
