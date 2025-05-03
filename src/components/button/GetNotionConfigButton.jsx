"use client";

import { useRouter } from "next/navigation";
import Button from "@components/button/Button";
import { useState } from "react";
import { useSession } from "next-auth/react";

const GetNotionConfigButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  function handleClick() {
    if (!session?.user) {
      alert("Please log in to sync.");
      return;
    }

    setLoading(true);
    router.push("/notion/config");
  }

  return (
    <Button
      type="button"
      text={loading ? "Loading..." : "View Notion Configuration"}
      onClick={handleClick}
      disabled={loading}
    />
  );
};

export default GetNotionConfigButton;
