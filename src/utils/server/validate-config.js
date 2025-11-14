import "server-only";
import logger from "@utils/shared/logger";
import { NextResponse } from "next/server";
import { getNotionConfigByUuid } from "@models/user";

export async function validateConfig(uuid) {
  // check if notion config setting
  // get notion config from DynamoDB by uuid
  const notionConfig = await getNotionConfigByUuid(uuid);

  const isDefaultGmail =
    Array.isArray(notionConfig.gcal_dic) &&
    notionConfig.gcal_dic.length > 0 &&
    Object.values(notionConfig.gcal_dic[0] || {})[0] === "xxxxxx@gmail.com";

  const invalid = isDefaultGmail;

  if (invalid) {
    logger.warn(`No Notion config found for user ${uuid}`);
    return {
      valid: false,
      response: NextResponse.json(
        {
          type: "config error",
          message:
            "Notion config not found. You may need to set up your Notion integration first.",
          needRefresh: false,
        },
        { status: 404 },
      ),
    };
  }

  return { valid: true, config: notionConfig };
}

export default validateConfig;
