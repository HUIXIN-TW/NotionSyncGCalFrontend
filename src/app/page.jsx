"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SignInButton from "@/components/button/SignInButton";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/profile");
    }
  }, [status, router]);

  return (
    <div className="home">
      <div className="welcome">
        <h1>Welcome to NOTICA!</h1>
        <div className="welcome_detail">
          <p>
            We use the Google Calendar API to sync selected calendars with
            Notion. By continuing, you agree to our{" "}
            <Link href="/privacy">Privacy Policy</Link> and{" "}
            <Link href="/terms">Terms of Service</Link>.
          </p>

          <h3 className="welcome_header">What this app does</h3>
          <ul className="welcome_list">
            <li>Secure sign-in via Google OAuth.</li>
            <li>Sync selected Google Calendar events.</li>
            <li>Link and manage your Notion workspace.</li>
            <li>Control how pages and events map/sync.</li>
            <li>Responsive on desktop and mobile.</li>
            <li>Tokens stored on AWS, encrypted at rest.</li>
          </ul>

          <p className="welcome_links">
            Open source:{" "}
            <a
              href="https://github.com/HUIXIN-TW/NotionSyncGCal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lambda Backend
            </a>
          </p>
        </div>
        {status === "unauthenticated" && <SignInButton />}
      </div>
    </div>
  );
}
