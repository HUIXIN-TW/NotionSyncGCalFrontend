/**
 * DynamoDB client configuration
 * Creates and exports a DynamoDB document client for database operations
 */
import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Create a DynamoDB client with the configured region
const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION || "us-east-1", // Default to us-east-1 if not specified
});

// Create a document client for easier interaction with DynamoDB
const ddb = DynamoDBDocumentClient.from(client);

export { ddb };
