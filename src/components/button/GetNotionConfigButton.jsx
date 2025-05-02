"use client";

import { useState } from "react";
import Button from "@components/button/Button";
import { useSession } from "next-auth/react";

const GetNotionConfigButton = ({ onConfigFetched }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function handleClick() {
    if (!session?.user) {
      alert("Please log in to sync.");
      return;
    }

    setLoading(true);

    try {
      // Fetch Notion config from the API
      const res = await fetch("/api/notion/get-config", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`, // Pass the user's token if required
        },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(
          "Failed to fetch Notion config: " + (data.error || JSON.stringify(data))
        );
        return;
      }

      // Pass the fetched data to the parent component
      onConfigFetched(data);

      console.log("Notion Config:", data);
      alert("Notion Config fetched successfully!");
    } catch (err) {
      console.error(err);
      console.error("Error fetching Notion config:", err);
      alert("Not Ready Yet! Please contact support.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      text={loading ? "Fetching..." : "Get Notion Config"}
      onClick={handleClick}
      disabled={loading}
    />
  );
};

export default GetNotionConfigButton;