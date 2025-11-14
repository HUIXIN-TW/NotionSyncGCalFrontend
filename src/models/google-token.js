import "server-only";
import logger from "@utils/shared/logger";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "@utils/server/db-client";

const TABLE_NAME = process.env.DYNAMODB_GOOGLE_OAUTH_TOKEN_TABLE;

export const updateGoogleTokens = async (
  uuid,
  accessToken,
  refreshToken,
  expiryDate,
  updatedAt,
) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: { uuid },
      UpdateExpression: `
        SET accessToken = :accessToken,
            refreshToken = :refreshToken,
            expiryDate = :expiryDate,
            updatedAt = :now
      `,
      ExpressionAttributeValues: {
        ":accessToken": accessToken,
        ":refreshToken": refreshToken,
        ":expiryDate": expiryDate,
        ":now": updatedAt,
      },
    };

    await ddb.send(new UpdateCommand(params));
  } catch (error) {
    logger.error("Error updating Google tokens", error);
    throw error;
  }
};

// get token by uuid
export const getGoogleTokensByUuid = async (uuid) => {
  try {
    const result = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { uuid },
      }),
    );
    return result.Item;
  } catch (error) {
    logger.error("Error getting Google tokens by UUID", error);
    throw error;
  }
};
