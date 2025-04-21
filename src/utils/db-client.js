/**
 * DynamoDB client configuration
 * Creates and exports a DynamoDB document client for database operations
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Create a DynamoDB client with the configured region
const client = new DynamoDBClient({
  region: process.env.MYAPP_AWS_REGION || "us-east-1", // Default to us-east-1 if not specified
  credentials: {
    accessKeyId: process.env.MYAPP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MYAPP_AWS_SECRET_ACCESS_KEY,
  },
});

// Create a document client for easier interaction with DynamoDB
const ddb = DynamoDBDocumentClient.from(client);

export { ddb };
