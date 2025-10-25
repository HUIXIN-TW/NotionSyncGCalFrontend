"use client";
import Button from "@components/button/Button";
import React, { useState } from "react";

const TestConnectionButton = ({ className, style }) => {
  const [loading, setLoading] = useState(false);

  async function handleTestConnection() {
    setLoading(true);
    try {
      const res = await fetch("/api/test-connect", { method: "GET" });
      const data = await res.json();

      if (!res.ok) {
        alert(`❌ ${data.message || "Test connection failed."}`);
      } else {
        alert(
          [
            "✅ Connection test completed",
            `Notion token: ${data.hasNotion ? "✅ Found" : "❌ Missing"}`,
            `Google token: ${data.hasGoogle ? "✅ Found" : "❌ Missing"}`,
          ].join("\n")
        );
      }
    } catch (err) {
      console.error("Test connection failed", err);
      alert("⚠️ Network or server error.");
    } finally {
      setLoading(false);
    }
  }

return (

      <Button
        text={loading ? "Testing Connection..." : "Test Connection"}
        onClick={handleTestConnection}
        disabled={loading}
      />

  );
};

export default TestConnectionButton;
