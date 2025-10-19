import logger from "@utils/logger";
import { ddb } from "@/utils/server/db-client";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import normalizeEmail from "@/utils/server/normalize-email";

const TABLE_NAME = process.env.DYNAMODB_USER_TABLE;

// Helper: validate username format
const isValidUsername = (username) =>
  /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(username);

// Create a user with validation and duplicate email check
export const createUser = async (userData) => {
  const provider = userData.provider || "credentials";
  const now = new Date().toISOString();
  const normalizedEmail = normalizeEmail(userData.email);

  if (!normalizedEmail) throw new Error("Email is required!");
  const username = userData.username || normalizedEmail.split("@")[0];

  // enforce password & username only for credentials provider
  if (provider === "credentials") {
    if (!userData.password) throw new Error("Password is required!");
    if (!isValidUsername(username)) {
      throw new Error(
        "Username invalid, it should contain 8–20 alphanumeric characters and be unique!",
      );
    }
  }

  const item = {
    uuid: uuidv4(),
    email: normalizedEmail,
    username,
    // include password only for credentials
    ...(provider === "credentials" && { password: userData.password }),
    role: userData.role || "user",
    image: userData.image || "",
    provider,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: "attribute_not_exists(email)", // Prevent duplicates
      }),
    );
    return item;
  } catch (error) {
    logger.error("Error creating user", error);
    throw error;
  }
};

// Get user by UUID
export const getUserById = async (id) => {
  try {
    const result = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { uuid: id },
      }),
    );
    return result.Item;
  } catch (error) {
    logger.error("Error getting user by ID", error);
    throw error;
  }
};

// Get user by email (requires GSI: EmailIndex)
export const getUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": normalizedEmail,
        },
      }),
    );
    return result.Items?.[0] || null;
  } catch (error) {
    logger.error("Error getting user by email", error);
    throw error;
  }
};

// Update user by ID
export const updateUser = async (id, updateData) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {
    ":updatedAt": new Date().toISOString(),
  };

  for (const key in updateData) {
    if (key !== "uuid" && key !== "id") {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updateData[key];
    }
  }

  updateExpressions.push("#updatedAt = :updatedAt");
  expressionAttributeNames["#updatedAt"] = "updatedAt";

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { uuid: id },
        UpdateExpression: "SET " + updateExpressions.join(", "),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );
    return result.Attributes;
  } catch (error) {
    logger.error("Error updating user", error);
    throw error;
  }
};

// Delete user by ID
export const deleteUser = async (id) => {
  try {
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { uuid: id },
      }),
    );
    return { success: true };
  } catch (error) {
    logger.error("Error deleting user", error);
    throw error;
  }
};

// Get all users (scan all)
export const getAllUsers = async () => {
  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      }),
    );
    return result.Items || [];
  } catch (error) {
    logger.error("Error getting all users", error);
    throw error;
  }
};
