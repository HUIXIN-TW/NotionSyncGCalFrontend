"use client";
import logger from "@utils/shared/logger";
import { useState } from "react";
import Button from "@components/button/Button";
import { useSession } from "next-auth/react";

const ConnectGCalButton = ({ className, style, text }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function handleClick() {
    if (!session?.user) {
      alert("Please log in to sync.");
      return;
    }

    setLoading(true);

    try {
      // Request an auth URL for Google OAuth
      const res = await fetch("/api/google/auth-url");
      const data = await res.json();

      if (!res.ok || data.error) {
        alert(
          "Failed to get auth URL: " + (data.error || JSON.stringify(data)),
        );
        return;
      }
      // Redirect user to Google consent screen
      window.location.href = data.url;
    } catch (err) {
      logger.error("Refresh GCal failed", err);
      alert("Error fetching auth URL: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className={className}
      style={style}
      text={loading ? "Refreshing..." : text || "Connect GCal Account"}
      onClick={handleClick}
      disabled={loading}
    />
  );
};

export default ConnectGCalButton;
