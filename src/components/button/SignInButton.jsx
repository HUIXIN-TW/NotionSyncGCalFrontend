"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import logger from "@/utils/shared/logger";
import Button from "@components/button/Button";

export default function SignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/profile",
      });

      if (result?.error) {
        logger.error("Google sign-in error", result.error);
        alert(`Google sign-in error: ${result.error}`);
        setLoading(false);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      alert(`Google sign-in exception: ${err}`);
      logger.error("Google sign-in exception", err);
      setLoading(false);
    }
  };

  return (
    <Button
      text={loading ? "Signing in..." : "Continue with Google"}
      onClick={handleGoogleLogin}
      disabled={loading}
    />
  );
}
