"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SignInButton from "@components/button/SignInButton";
import styles from "./page.module.css";
import { isEmbedded } from "@utils/client/embed-context";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (isEmbedded()) {
      router.replace("/embedded/profile");
    } else if (status === "authenticated") {
      router.replace("/profile");
    }
  }, [status, router]);

  return (
    <div className={styles.home}>
      <h2>Welcome to NOTICA!</h2>
      <div className={styles.detail}>
        <p>
          We use the Google Calendar API to sync selected calendars with Notion.
          By continuing, you agree to our{" "}
          <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>

        <p>
          Open source:{" "}
          <a
            href="https://github.com/HUIXIN-TW/NotionSyncGCal"
            target="_blank"
            rel="noopener noreferrer"
          >
            NotionSyncGCal
          </a>
        </p>
        <br />
        <br />
      </div>
      {status === "unauthenticated" && <SignInButton />}
    </div>
  );
}
