"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import logger from "@/utils/shared/logger";
import Button from "@components/button/Button";

function inIframe() {
  if (typeof window === "undefined") return false;
  return window.self !== window.top;
}

export default function SignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const listener = (e) => {
      if (e.data?.type === "loginSuccess") {
        logger.info("Received loginSuccess message from popup");
        window.location.reload();
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const callbackUrl = "/profile";

    try {
      // notion iframe
      if (inIframe()) {
        const url = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`;
        const win = window.open(url, "_blank", "noopener,noreferrer");

        // back up plan: monitor popup window
        const timer = setInterval(() => {
          if (win?.closed) {
            window.location.reload();
            clearInterval(timer);
          }
        }, 1000);
        setLoading(false);
        return;
      }

      // normal flow
      const result = await signIn("google", { redirect: false, callbackUrl });

      if (result?.error) {
        logger.error("Google sign-in error", result.error);
        alert(`Google sign-in error: ${result.error}`);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      logger.error("Google sign-in exception", err);
      alert(`Google sign-in exception: ${err}`);
    } finally {
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
