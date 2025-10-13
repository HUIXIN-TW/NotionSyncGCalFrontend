"use client";
import logger from "@utils/logger";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

import Profile from "@components/profile/Profile";

const MyProfile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    // If the status is not "loading" and there's no session, redirect
    if (status !== "loading" && !session) {
      logger.info("No session, redirecting to authflow");
      router.push("/authflow");
    }
  }, [session, status, router]);

  useEffect(() => {
    const google = params.get("google");
    const notion = params.get("notion");
    const reason = params.get("reason");

    let msg;

    if (google === "connected") msg = "✅ Google connected successfully";
    else if (google === "error") {
      if (reason === "email_mismatch")
        msg = "⚠️ Google account does not match your login account";
      else if (reason === "token")
        msg = "❌ Token exchange failed, please reauthorize";
      else if (reason === "state")
        msg = "⚠️ OAuth security verification failed";
      else msg = "❌ Google authorization failed, please try again later";
    }

    if (notion === "connected") msg = "✅ Notion connected successfully";
    else if (notion === "error") {
      if (reason === "token") msg = "❌ Notion token exchange failed";
      else if (reason === "state")
        msg = "⚠️ Notion security verification failed";
      else msg = "❌ Notion authorization failed, please try again later";
    }

    setNotice(msg);
    if (msg) setTimeout(() => setNotice(null), 4000);
  }, [params]);

  return (
    <div>
      <Profile session={session} signOut={signOut} notice={notice} />
    </div>
  );
};

export default MyProfile;
