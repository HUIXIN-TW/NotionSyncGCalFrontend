"use client";
import logger from "@utils/shared/logger";
import { pollLastSyncLog } from "@utils/client/polling-user-last-sync-log";
import { useState } from "react";
import Button from "@components/button/Button";
import { useSession } from "next-auth/react";

const SyncButton = ({ text, onSync, disabled }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function triggerSync() {
    logger.debug("[SyncButton] onClick fired", { loading, disabled });
    if (!session?.user) {
      logger.warn("[SyncButton] no session user; prompting login");
      alert("Please log in to sync.");
      return;
    }

    const body = {
      uuid: session.user.uuid,
      email: session.user.email,
    };

    const syncPromise = (async () => {
      if (loading) return;
      setLoading(true);
      try {
        // trigger sync
        const enqueueAtMs = Date.now();
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const triggerResult = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = triggerResult.message || JSON.stringify(triggerResult);
          let userMsg = msg;

          if (
            msg.includes("Insufficient Permission") ||
            msg.includes("insufficientPermissions") ||
            msg.includes("insufficient authentication scopes")
          ) {
            userMsg =
              "Insufficient permission.\nGo to Settings → reconnect Google Calendar.\nRemember to click **Select all** when authorizing.";
          }

          alert(userMsg);
          logger.error("Sync failed", triggerResult);
          return { type: "error", message: userMsg, raw: triggerResult };
        }

        logger.debug("[SyncButton] sync enqueued", triggerResult);
        // poll for completion
        return await pollLastSyncLog({
          triggerTimeMs: enqueueAtMs,
        });
      } catch (err) {
        logger.error("Sync error", err);
        return { type: "error", message: err.message };
      } finally {
        setTimeout(() => setLoading(false), 3000);
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
