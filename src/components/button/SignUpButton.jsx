"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@components/button/Button";
import logger from "@/utils/shared/logger";

export default function SignUpButton() {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);

    try {
      const res = await signIn("google", { callbackUrl: "/getting-started" });
      if (res?.error) {
        alert(`Google sign-in error: ${res.error}`);
        setGoogleLoading(false);
      } else if (res?.url) {
        router.push(res.url);
      }
    } catch (err) {
      alert(`Google sign-in exception: ${err}`);
      logger.error("Google sign-in error", err);
      setGoogleLoading(false);
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
