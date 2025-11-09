"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import logger from "@/utils/shared/logger";
import Button from "@components/button/Button";
import { Loader2 } from "lucide-react";

export default function SignInButton({
  className,
  style,
  text = "Continue with Google",
  title = "Sign in with Google",
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const callbackUrl = "/profile";

    try {
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
      text={
        loading ? (
          <Loader2 className="animate-spin" size={20} strokeWidth={2} />
        ) : (
          text
        )
      }
      onClick={handleGoogleLogin}
      disabled={loading}
      className={className}
      style={style}
      title={title}
    />
  );
}
