import "server-only";
import { NextResponse } from "next/server";
import logger from "@utils/logger";
import {
  getNotionConfig 
} from "@/utils/server/s3-client";

export async function validateConfig(uuid) {

// check if notion config setting
const notionConfig = await getNotionConfig(uuid);

// check for default/empty config values
const isDefaultToken =
    !notionConfig.notion_token || notionConfig.notion_token === "xxxxxxx";

  const isDefaultUrl =
    !notionConfig.urlroot ||
    notionConfig.urlroot === "https://www.notion.so/" ||
    notionConfig.urlroot.trim() === "";

  const isDefaultGmail =
    Array.isArray(notionConfig.gcal_dic) &&
    notionConfig.gcal_dic.length > 0 &&
    Object.values(notionConfig.gcal_dic[0] || {})[0] === "xxxxxx@gmail.com";


const invalid = isDefaultToken || isDefaultUrl || isDefaultGmail;

  if (invalid) {
    logger.warn(`No Notion config found for user ${uuid}`);
    return {
      valid: false,
      response: NextResponse.json(
        {
          type: "config error",
          message: "Notion config not found. You may need to set up your Notion integration first.",
          needRefresh: false,
        },
        { status: 404 },
      ),
    };
  }

  return { valid: true, config: notionConfig };
}

export default validateConfig;