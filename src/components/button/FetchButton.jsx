"use client";

import React, { useState } from "react";
import Button from "@components/button/Button";
import { loadRemoteConfig } from "@/utils/client/load-remote-config";

export default function FetchButton({
  setEditableConfig,
  setLastFetchedAt,
  setLastModifiedAt,
}) {
  const [loading, setLoading] = useState(false);

  const fetchFromS3 = async () => {
    setLoading(true);
    try {
      await loadRemoteConfig({
        setEditableConfig,
        setLastFetchedAt,
        setLastModifiedAt,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      text={loading ? "Fetching..." : "Fetch Latest Configuration"}
      onClick={fetchFromS3}
      disabled={loading}
    />
  );
}
