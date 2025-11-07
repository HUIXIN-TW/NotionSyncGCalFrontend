"use client";

import styles from "./getting-started.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button/Button";
import { useConnectionNotice } from "@/hooks/useConnectionNotice";
import RefreshGCalButton from "@components/button/RefreshGCalButton";
import RefreshNotionButton from "@/components/button/RefreshNotionButton";
import TestConnectionButton from "@components/button/TestConnectionButton";
import SignOutButton from "@/components/button/SignOutButton";

const GettingStarted = () => {
  const router = useRouter();
  useConnectionNotice();

  const [googleStatus, setGoogleStatus] = useState(null);
  const [notionStatus, setNotionStatus] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGoogleStatus(localStorage.getItem("googleStatus"));
      setNotionStatus(localStorage.getItem("notionStatus"));
    }
  }, []);

  const handleFinishSetup = () => {
    router.replace("/notion/config");
  };

  return (
    <>
      <h1 className="title">Let’s Get Your Sync Ready</h1>

      <div className={styles.gettingstartedcard_container}>
        <RefreshGCalButton
          className="outline_btn"
          text={googleStatus || "Step 1: Connect Google Calendar Account"}
        />

        <RefreshNotionButton
          className="outline_btn"
          text={notionStatus || "Step 2: Connect Notion Database Account"}
        />

        <TestConnectionButton
          className="outline_btn"
          text="Step 3: Test Notion & GCal Connection"
        />

        <Button
          className="outline_btn"
          text="Finish Connection Setup. Proceed to Settings"
          onClick={handleFinishSetup}
        />

        <br />
        <SignOutButton text="❌ Cancel Setup Process. Logout" />
      </div>
    </>
  );
};

export default GettingStarted;
