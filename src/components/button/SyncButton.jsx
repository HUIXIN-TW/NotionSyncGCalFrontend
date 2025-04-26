"use client";

import { useState } from "react";
import Button from "@components/button/Button";
import { useSession } from "next-auth/react";

const SyncButton = ({ onSync }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function triggerSync() {
    if (!session?.user) {
      alert("Please log in to sync.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid: session.user.uuid,
          email: session.user.email,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Sync successful!");
      } else {
        alert("Sync failed: " + (result.error || "Unknown error"));
      }
      if (onSync) onSync(result);
      return result;
    } catch (err) {
      console.error("Sync error:", err);
      const errorResult = { status: "error", message: err.message };
      alert("Sync error: " + err.message);
      if (onSync) onSync(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      text={loading ? "Syncing..." : "Sync Calendar"}
      onClick={triggerSync}
      disabled={loading}
    />
  );
};

export default SyncButton;
