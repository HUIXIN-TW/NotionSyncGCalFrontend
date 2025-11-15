import "server-only";
import logger from "@utils/shared/logger";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "@utils/server/db-client";

const TABLE_NAME = process.env.DYNAMODB_NOTION_OAUTH_TOKEN_TABLE;

export const updateNotionTokens = async (
  uuid,
  accessToken,
  workspaceId,
  duplicatedTemplateId,
  updatedAt,
) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: { uuid },
      UpdateExpression:
        "SET accessToken = :accessToken, workspaceId = :workspaceId, duplicatedTemplateId = :duplicatedTemplateId, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":accessToken": accessToken,
        ":workspaceId": workspaceId,
        ":duplicatedTemplateId": duplicatedTemplateId,
        ":updatedAt": updatedAt,
      },
    };
    await ddb.send(new UpdateCommand(params));
  } catch (error) {
    logger.error("Failed to update Notion tokens", error);
    throw error;
  }
};

// get token by uuid
export const getNotionTokensByUuid = async (uuid) => {
  try {
    const result = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { uuid },
      }),
    );
    return result.Item;
  } catch (error) {
    logger.error("Error getting Notion tokens by UUID", error);
    throw error;
  }
};
