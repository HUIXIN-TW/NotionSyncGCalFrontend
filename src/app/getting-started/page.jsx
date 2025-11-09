"use client";

import styles from "./getting-started.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@/components/button/Button";
import { useConnectionNotice } from "@/hooks/useConnectionNotice";
import RefreshGCalButton from "@components/button/RefreshGCalButton";
import RefreshNotionButton from "@/components/button/RefreshNotionButton";
import TestConnectionButton from "@components/button/TestConnectionButton";
import SignOutButton from "@/components/button/SignOutButton";
import LinkToNotionTemplateButton from "@/components/button/LinkToNotionTemplateButton";

const GettingStarted = () => {
  const { data: session } = useSession();
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

  if (!session?.user) return <div>Please log in to get started.</div>;

  return (
    <>
      <h2>Let’s Get Your Sync Ready</h2>

      <div className={styles.gettingstartedcard_container}>
        <RefreshGCalButton
          className="outline_btn"
          text={googleStatus || "Step 1: Connect Google Calendar Account"}
        />

        <RefreshNotionButton
          className="outline_btn"
          text={notionStatus || "Step 2: Connect Notion Database Account"}
        />

        <LinkToNotionTemplateButton
          className="outline_btn"
          text="Step 3: Open Notion Template to duplicate"
        />

        <Button
          className="outline_btn"
          text="Finish Connection Setup. Proceed to Settings"
          onClick={handleFinishSetup}
        />

        <br />
      </div>
    </>
  );
};

export default GettingStarted;
