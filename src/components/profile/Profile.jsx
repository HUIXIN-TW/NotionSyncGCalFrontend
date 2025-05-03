"use client";

import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import Button from "@components/button/Button";
import SyncButton from "@components/button/SyncButton";
import RefreshGCalButton from "@components/button/RefreshGCalButton";
import GetNotionConfigButton from "@components/button/GetNotionConfigButton";

const isProd = true; //process.env.NODE_ENV === "production";

const Profile = ({ session, signOut }) => {
  const [now, setNow] = useState(Date.now());
  const [syncResult, setSyncResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStartedAt, setSyncStartedAt] = useState(null);
  const [syncCooldownUntil, setSyncCooldownUntil] = useState(null);

  // Load saved cooldown from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("syncCooldownUntil");
    if (saved) {
      const savedTime = parseInt(saved, 10);
      if (!isNaN(savedTime)) {
        if (Date.now() < savedTime) {
          setSyncCooldownUntil(savedTime);
        } else {
          localStorage.removeItem("syncCooldownUntil");
        }
      }
    }
  }, []); // empty deps -> only runs once on mount

  // Update `now` every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("syncResult");
    const storedTime = localStorage.getItem("syncResultSavedAt");
    if (
      stored &&
      storedTime &&
      Date.now() - parseInt(storedTime, 10) < 10 * 60_000
    ) {
      try {
        setSyncResult(JSON.parse(stored));
      } catch {
        console.warn("Corrupted syncResult");
      }
    }
  }, []);

  useEffect(() => {
    if (syncResult) {
      localStorage.setItem("syncResult", JSON.stringify(syncResult));
      localStorage.setItem("syncResultSavedAt", Date.now().toString());
    }
  }, [syncResult]);

  if (!session?.user) {
    return (
      <div className={styles.profile_loading}>Loading your profile...</div>
    );
  }

  const { email, uuid, username } = session.user;

  const syncDisabled = syncCooldownUntil && now < syncCooldownUntil;

  const handleSync = async (syncPromise) => {
    setIsSyncing(true);
    setSyncStartedAt(Date.now());

    try {
      const result = await syncPromise;
      setSyncResult(result);

      if (isProd && result?.type === "success") {
        const cooldownUntil = Date.now() + 180_000;
        setSyncCooldownUntil(cooldownUntil);
        localStorage.setItem("syncCooldownUntil", cooldownUntil.toString());
      }
    } catch (err) {
      console.error("Unexpected sync failure:", err);
      setSyncResult({ type: "error", message: "Unexpected sync failure." });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={styles.profile_container}>
      <div className={styles.profile_image_container}>
        {session.user.image && (
          <img
            className={styles.profile_image}
            src={session.user.image}
            alt="Profile Image"
          />
        )}
        {!session.user.image && (
          <img
            className={styles.profile_default_image}
            src="./assets/images/App.png"
            alt="Default Profile Image"
          />
        )}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>UUID:</span> {uuid}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>Email:</span> {email}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>Name:</span> {username}
      </div>
      {syncResult && (
        <>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Type:</span>{" "}
            {syncResult.type}
          </div>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Message:</span>{" "}
            {syncResult.message}
          </div>
        </>
      )}

      <GetNotionConfigButton />
      {syncResult?.needRefresh && <RefreshGCalButton />}

      <SyncButton
        text={
          isSyncing && syncStartedAt
            ? `Syncing... (${Math.ceil((Date.now() - syncStartedAt) / 1000)}s)`
            : syncDisabled
              ? `You can sync again in ${Math.ceil((syncCooldownUntil - Date.now()) / 1000)}s`
              : "Sync Calendar"
        }
        onSync={handleSync}
        disabled={syncDisabled || isSyncing}
        className={syncDisabled ? "cooldown_disabled" : ""}
      />

      <Button text="Sign Out" onClick={signOut} />
    </div>
  );
};

export default Profile;
