"use client";
import logger, { isProdRuntime as isProd } from "@/utils/shared/logger";
import config from "@/config/rate-limit";
import { useCountdown } from "@/hooks/useCountdown";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";
import SyncButton from "@components/button/SyncButton";
import SupportSection from "@components/profile/SupportSection";

const Profile = ({ session }) => {
  const user = session?.user;
  const router = useRouter();
  const [syncResult, setSyncResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStartedAt, setSyncStartedAt] = useState(null);

  // Rate limit configuration
  const SYNC_USER_MIN_MS = config.SYNC_USER_MIN_MS ?? 10 * 60_000;
  const { startCountdown, isCountingDown, formattedRemaining } =
    useCountdown("cooldown:sync");

  // Elapsed time since sync started
  const elapsedSec = useElapsedTime(syncStartedAt);

  // --- 1. Load once when user is known ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user?.uuid) return;

    // keys
    const key = `syncResult:${user.uuid}`;
    try {
      const latestSyncResult = localStorage.getItem(key);
      setSyncResult(JSON.parse(latestSyncResult));
    } catch (e) {
      logger.warn("Failed to restore syncResult", e);
    }
  }, [user?.uuid]);

  // --- 2. Save whenever syncResult changes ---
  useEffect(() => {
    if (!syncResult || typeof window === "undefined" || !user?.uuid) return;
    try {
      localStorage.setItem(
        `syncResult:${user.uuid}`,
        JSON.stringify(syncResult),
      );
    } catch (err) {
      logger.warn("Failed to persist syncResult", err);
    }
  }, [syncResult, user?.uuid]);

  // --- 3. Load from session: If new user, redirect to getting started ---
  useEffect(() => {
    if (session?.isNewUser) {
      // set local storage flag
      localStorage.setItem("newUser:v1", "true");
      router.push("/getting-started");
    }
  }, [session, router]);

  // User details
  if (!user) {
    return (
      <div className={styles.profile_loading}>Loading your profile...</div>
    );
  }
  const { email, uuid, username, image } = user;

  const handleSync = async (syncPromise) => {
    setIsSyncing(true);
    setSyncStartedAt(Date.now());

    try {
      const result = await syncPromise;
      setSyncResult(result);
      startCountdown(SYNC_USER_MIN_MS);
    } catch (err) {
      logger.error("Unexpected sync failure", err);
      setSyncResult({
        type: "error",
        message: "Unexpected sync failure.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={styles.profile_container}>
      <div className={styles.profile_image_container}>
        {image && (
          <img
            className={styles.profile_image}
            src={image}
            alt="Profile Image"
          />
        )}
        {!image && (
          <img
            className={styles.profile_default_image}
            src="./assets/images/notica.png"
            alt="Default Profile Image"
          />
        )}
      </div>
      {!isProd && (
        <>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>UUID:</span> {uuid}
          </div>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Name:</span> {username}
          </div>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Status:</span>{" "}
            {syncResult?.type ?? "-"}
          </div>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Notion Database ID:</span>{" "}
            {syncResult?.message?.summary?.notion_config?.database_id ?? "-"}
          </div>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>
              Google Calendar Account:
            </span>{" "}
            {email}
          </div>
        </>
      )}
      {syncResult && (
        <>
          {syncResult?.type === "sync_success" ? (
            <>
              <div className={styles.profile_detail}>
                <span className={styles.profile_label}>
                  Date Range (Synced):
                </span>{" "}
                {syncResult?.message?.summary?.notion_config?.range ?? "-"}
              </div>
              <div className={styles.profile_detail}>
                <span className={styles.profile_label}>
                  Google Events Synced:
                </span>{" "}
                {syncResult?.message?.summary?.google_event_count ?? "-"}
              </div>
              <div className={styles.profile_detail}>
                <span className={styles.profile_label}>
                  Notion Tasks Synced:
                </span>{" "}
                {syncResult?.message?.summary?.notion_task_count ?? "-"}
              </div>
              <div className={styles.profile_detail}>
                <span className={styles.profile_label}>Last Sync Time:</span>{" "}
                {syncResult?.message?.trigger_time ?? "-"}
              </div>
            </>
          ) : (
            <div className={styles.profile_detail}>
              <span className={styles.profile_label}>Message:</span>{" "}
              {syncResult?.message ?? "-"}
            </div>
          )}
        </>
      )}

      <SyncButton
        text={
          isSyncing && syncStartedAt
            ? `Syncing... (${elapsedSec}s)`
            : isCountingDown
              ? `You can sync again in ${formattedRemaining}`
              : `Sync Calendar`
        }
        onSync={handleSync}
        disabled={isSyncing || (isCountingDown && isProd)}
      />

      <SupportSection />
    </div>
  );
};

export default Profile;
