"use client";

import { useSession } from "next-auth/react";
import NotionCard from "@components/notioncard/NotionCard";

const NotionConfigPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading session...</div>;

  return <NotionCard session={session} />;
};

export default NotionConfigPage;
