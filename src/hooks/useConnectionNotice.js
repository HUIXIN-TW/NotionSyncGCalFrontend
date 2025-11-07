"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useConnectionNotice() {
  const params = useSearchParams();

  useEffect(() => {
    const google = params.get("google");
    const notion = params.get("notion");
    const reason = params.get("reason");

    let googleMsg = null;
    let notionMsg = null;

    // ----- Google -----
    if (google === "connected") {
      googleMsg = "✅ Google connected successfully";
    } else if (google === "error") {
      if (reason === "email_mismatch") {
        googleMsg = "⚠️ Google account does not match your login account";
      } else if (reason === "token") {
        googleMsg = "❌ Token exchange failed, please reauthorize";
      } else if (reason === "state") {
        googleMsg = "⚠️ OAuth security verification failed";
      } else {
        googleMsg = "❌ Google authorization failed, please try again later";
      }
    }

    // ----- Notion -----
    if (notion === "connected") {
      notionMsg = "✅ Notion connected successfully";
    } else if (notion === "error") {
      if (reason === "token") {
        notionMsg = "❌ Notion token exchange failed";
      } else if (reason === "state") {
        notionMsg = "⚠️ Notion security verification failed";
      } else {
        notionMsg = "❌ Notion authorization failed, please try again later";
      }
    }

    // Save to localStorage
    if (googleMsg) localStorage.setItem("googleStatus", googleMsg);
    if (notionMsg) localStorage.setItem("notionStatus", notionMsg);
  }, [params]);
}
