"use client";
import logger, { isProdRuntime as isProd } from "@/utils/shared/logger";
import config from "@/config/rate-limit";
import { useCountdown } from "@/hooks/useCountdown";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import Button from "@components/button/Button";
import SyncButton from "@components/button/SyncButton";
import GetNotionConfigButton from "@components/button/GetNotionConfigButton";

const Profile = ({ session, signOut }) => {
  const user = session?.user;
  const [syncResult, setSyncResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStartedAt, setSyncStartedAt] = useState(null);

  // Rate limit configuration
  const SYNC_USER_MIN_MS = config.SYNC_USER_MIN_MS ?? 10 * 60_000;
  const { startCountdown, isCountingDown, formattedRemaining } =
    useCountdown("cooldown:sync");

  const elapsedSec = useElapsedTime(syncStartedAt);

  // --- 1. Load once when component mounts ---
  useEffect(() => {
    const stored = localStorage.getItem("syncResult");
    const storedTime = localStorage.getItem("syncResultSavedAt");

    if (
      stored &&
      storedTime &&
      Date.now() - Number(storedTime) < 10 * 60_000 // 10 minutes
    ) {
      try {
        setSyncResult(JSON.parse(stored));
      } catch {
        logger.warn("Corrupted syncResult in storage");
      }
    }
  }, []); // no dependencies → run once only

  // --- 2. Save whenever syncResult changes ---
  useEffect(() => {
    if (!syncResult) return;
    try {
      localStorage.setItem("syncResult", JSON.stringify(syncResult));
      localStorage.setItem("syncResultSavedAt", Date.now().toString());
    } catch (err) {
      logger.warn("Failed to persist syncResult", err);
    }
  }, [syncResult]);

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
            src="./assets/images/App.png"
            alt="Default Profile Image"
          />
        )}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>GCal Account:</span> {email}
      </div>
      {!isProd && (
        <>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>UUID:</span> {uuid}
          </div>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Name:</span> {username}
          </div>
        </>
      )}
      {syncResult && (
        <>
          {!isProd && (
            <div className={styles.profile_detail}>
              <span className={styles.profile_label}>Type:</span>{" "}
              {syncResult.type}
            </div>
          )}
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Message:</span>{" "}
            {syncResult.message}
          </div>
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
      <GetNotionConfigButton />
      <Button text="Sign Out" onClick={signOut} />

      <div className={styles.support_section}>
        <span className={styles.note}>
          Enjoying NotionSyncGCal? Support me:
        </span>
        <a
          href="https://buymeacoffee.com/huixinyang"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.profile_bmac_button}
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me a Coffee"
            style={{
              height: "36px",
              width: "130px",
              marginTop: "0.25rem",
              borderRadius: "6px",
              boxShadow: "0 0 4px rgba(0,0,0,0.1)",
            }}
          />
        </a>
      </div>
    </div>
  );
};

export default Profile;
