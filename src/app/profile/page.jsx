"use client";
import logger from "@utils/shared/logger";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

import Profile from "@components/profile/Profile";

const MyProfile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the status is not "loading" and there's no session, redirect
    if (status !== "loading" && !session) {
      logger.info("No session, redirecting to authflow");
      router.push("/");
    }
  }, [session, status, router]);

  return (
    <div>
      <Profile session={session} />
    </div>
  );
};

export default MyProfile;
