"use client";

import React, { useState } from "react";
import styles from "./profile.module.css";
import Button from "@components/button/Button";
import SyncButton from "@components/button/SyncButton";

const Profile = ({ session, signOut }) => {
  const [syncResult, setSyncResult] = useState(null);

  if (!session?.user) {
    return (
      <div className={styles.profile_loading}>Loading your profile...</div>
    );
  }

  const { email, uuid, username, role } = session.user;
  console.log("Session User:", session.user);

  return (
    <div className={styles.profile_container}>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>Email:</span> {email}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>UUID:</span> {uuid}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>Name:</span> {username}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>Role:</span> {role}
      </div>
      {syncResult && (
        <>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Sync Status:</span>{" "}
            {syncResult.status}
          </div>
          <div className={styles.profile_detail}>
            <span className={styles.profile_label}>Message:</span>{" "}
            {syncResult.message}
          </div>
        </>
      )}
      <SyncButton onSync={setSyncResult} />
      <Button text="Sign Out" onClick={signOut} />
    </div>
  );
};

export default Profile;
