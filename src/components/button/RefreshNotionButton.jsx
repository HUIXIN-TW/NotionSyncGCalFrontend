"use client";
import logger from "@utils/logger";
import { useState } from "react";
import Button from "@components/button/Button";
import { useSession } from "next-auth/react";

const RefreshNotionButton = ({ className, style }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function handleClick() {
    if (!session?.user) {
      alert("Please log in to sync.");
      return;
    }

    setLoading(true);

    try {
      // Request an auth URL for Notion OAuth
      const res = await fetch("/api/notion/auth-url");
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
      logger.error("Refresh Notion failed", err);
      alert("Error fetching auth URL: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      text={loading ? "Refreshing..." : "Connect or Refresh Notion Token"}
      onClick={handleClick}
      disabled={loading}
    />
  );
};

export default RefreshNotionButton;
