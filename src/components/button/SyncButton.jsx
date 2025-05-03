"use client";

import { useState } from "react";
import Button from "@components/button/Button";
import { useSession } from "next-auth/react";

const SyncButton = ({ text, onSync, disabled }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function triggerSync() {
    if (!session?.user) {
      alert("Please log in to sync.");
      return;
    }

    const body = {
      uuid: session.user.uuid,
      email: session.user.email,
    };

    const syncPromise = (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const result = await res.json();
        if (!res.ok) {
          alert("Sync failed: " + result.message);
          console.error("Sync failed:", result);
        }
        return result;
      } catch (err) {
        console.error("Sync error:", err);
        return { type: "error", message: err.message };
      } finally {
        setLoading(false);
      }
    })();

    if (onSync) onSync(syncPromise);

    return syncPromise;
  }

  return (
    <Button
      type="button"
      text={text}
      onClick={triggerSync}
      disabled={loading || disabled}
    />
  );
};

export default SyncButton;
