"use client";

import styles from "./welcome.module.css";
import { useRouter } from "next/navigation";
import Button from "@/components/button/Button";
import RefreshGCalButton from "@components/button/RefreshGCalButton";
import RefreshNotionButton from "@/components/button/RefreshNotionButton";
import TestConnectionButton from "@components/button/TestConnectionButton";

const Welcome = () => {
  const router = useRouter();

  return (
    <div className="home">
      <div className="welcome">
        <h1 className="title">Welcome to NotionSyncGCal! Let's sync.</h1>
        <div className="welcome_detail">
          <div className={styles.welcomecard_container}>
            <RefreshGCalButton text="Step 1: Connect Google Calendar Account" />
            <RefreshNotionButton text="Step 2: Connect Notion Database Account" />
            <TestConnectionButton text="Step 3: Test Notion & GCal Connection" />
            <Button
              type="button"
              text="Step 4: Go to Set Up Sync Configuration"
              onClick={() => router.push("/notion/config")}
              className="black_btn"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
