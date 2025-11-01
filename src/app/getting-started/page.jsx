"use client";

import styles from "./getting-started.module.css";
import { useRouter } from "next/navigation";
import Button from "@/components/button/Button";
import RefreshGCalButton from "@components/button/RefreshGCalButton";
import RefreshNotionButton from "@/components/button/RefreshNotionButton";
import TestConnectionButton from "@components/button/TestConnectionButton";
import SignOutButton from "@/components/button/SignOutButton";

const GettingStarted = () => {
  const router = useRouter();

  const handleFinishSetup = () => {
    // Redirect to notion config page
    router.replace("/notion/config");
  };

  return (
    <>
      <h1 className="title">Let’s Get Your Sync Ready</h1>
      <div className={styles.gettingstartedcard_container}>
        <RefreshGCalButton text="Step 1: Connect Google Calendar Account" />
        <RefreshNotionButton text="Step 2: Connect Notion Database Account" />
        <TestConnectionButton text="Step 3: Test Notion & GCal Connection" />
        <Button
          type="button"
          text="✅ Finish Connection Setup. Proceed to Setting"
          onClick={handleFinishSetup}
          className="outline_btn"
        />
        <SignOutButton
          className="outline_btn"
          text="❌ Cancel Setup Process. Exit to Home Page"
        />
      </div>
    </>
  );
};

export default GettingStarted;
