"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Button from "@components/button/Button";
import config from "@/config/client/notion";
import logger from "@utils/shared/logger";

const LinkToNotionTemplateButton = ({ className, style, text }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function handleClick() {
    try {
      setLoading(true);
      logger.info("Redirecting to Notion template", {
        user: session?.user?.email,
      });
      window.open(config.NOTION_PAGE_TEMPLATE_URL, "_blank");
    } catch (err) {
      logger.error("Failed to link to Notion template", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className={className}
      style={style}
      text={loading ? "Linking..." : text || "Open Template"}
      onClick={handleClick}
      disabled={loading}
    />
  );
};

export default LinkToNotionTemplateButton;
