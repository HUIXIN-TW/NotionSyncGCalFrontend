"use client";

import Button from "@components/button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  return (
    <div className="home">
      <div className="welcome">
        <h1>Welcome to NotionSyncGCal!</h1>
        <div className="welcome_detail">
          <p>
            We use the Google Calendar API to sync selected calendars with
            Notion. By continuing, you agree to our{" "}
            <Link href="/privacy">Privacy Policy</Link> and{" "}
            <Link href="/terms">Terms of Service</Link>.
          </p>

          <h3 className="welcome_heading">What this app does</h3>
          <ul className="welcome_list">
            <li>Secure sign-in via Google OAuth.</li>
            <li>Sync selected Google Calendar events.</li>
            <li>Link and manage your Notion workspace.</li>
            <li>Control how pages and events map/sync.</li>
            <li>Responsive on desktop and mobile.</li>
            <li>Stores tokens securely on AWS (encrypted at rest).</li>
          </ul>

          <p className="welcome_links">
            This app is open source and contributions welcome:{" "}
            <a
              href="https://github.com/HUIXIN-TW/NotionSyncGCal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lambda Backend
            </a>
          </p>
        </div>

        <Button
          text="Let's Get Started"
          type="button"
          className="black_btn"
          onClick={() => {
            router.push("/authflow");
          }}
        ></Button>
      </div>
    </div>
  );
};

export default Home;
