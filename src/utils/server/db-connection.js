import "server-only";
/**
 * Database connection management
 * Provides functions to connect to and check the status of the DynamoDB connection
 */
import logger from "@utils/logger";
import { ddb } from "@/utils/server/db-client.js";
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";

// Track the connection state
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

/**
 * Connects to the DynamoDB database
 * @returns {Promise<void>}
 * @throws {Error} If connection fails after maximum attempts
 */
const connectToDatabase = async () => {
  if (isConnected) {
    logger.info("DynamoDB is already connected");
    return;
  }

  try {
    // Check if we can connect to DynamoDB by listing tables
    await ddb.send(
      new DescribeTableCommand({
        TableName: process.env.DYNAMODB_USER_TABLE,
      }),
    );

    isConnected = true;
    connectionAttempts = 0;
    logger.info("DynamoDB connected successfully");
  } catch (error) {
    connectionAttempts++;
    logger.error(
      `Error connecting to DynamoDB (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`,
      error,
    );

    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      logger.error(
        "Maximum connection attempts reached. Please check your AWS credentials and network connection.",
      );
      throw new Error(
        `Failed to connect to DynamoDB after ${MAX_CONNECTION_ATTEMPTS} attempts: ${error.message}`,
      );
    }

    // Wait before retrying (exponential backoff)
    const delay = Math.pow(2, connectionAttempts) * 1000;
    logger.info(`Retrying in ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry connection
    return connectToDatabase();
  }
};

/**
 * Checks if the database is connected
 * @returns {boolean} Connection status
 */
const isDatabaseConnected = () => {
  return isConnected;
};

/**
 * Resets the connection state (useful for testing)
 */
const resetConnection = () => {
  isConnected = false;
  connectionAttempts = 0;
};

export { connectToDatabase, isDatabaseConnected, resetConnection };
