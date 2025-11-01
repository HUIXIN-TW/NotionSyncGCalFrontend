"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useConnectionNotice(setMsg) {
  const params = useSearchParams();

  useEffect(() => {
    const google = params.get("google");
    const notion = params.get("notion");
    const reason = params.get("reason");

    let msg = "";

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

    setMsg(msg);

    if (!msg) return;

    const timer = setTimeout(() => setMsg(""), 4000);

    return () => clearTimeout(timer);
  }, [params]);
}
