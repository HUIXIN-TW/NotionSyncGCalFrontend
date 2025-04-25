/**
 * DynamoDB connection and operations test
 * Tests basic DynamoDB operations: create, read, and delete
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
// Import ddb directly from db-client.js
import { ddb } from "../src/utils/db-client.js"; 
import {
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

/**
 * Removes test data from DynamoDB after successful creation
 * @param {string} tableName - Name of the DynamoDB table
 * @param {Object} key - Key of the item to delete
 * @returns {Promise<Object>} Result of the delete operation
 */
async function removeCreatedData(tableName, key) {
  try {
    console.log(`🗑️ Removing created data from ${tableName}...`);

    const deleteCommand = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });

    const result = await ddb.send(deleteCommand);
    console.log(`✅ Removed data from ${tableName}`);
    return result;
  } catch (err) {
    console.error(`❌ Error removing data from ${tableName}:`, err);
    throw err;
  }
}

describe("DynamoDB Client Tests", async () => {
  it("should perform basic CRUD operations", async () => {
    // Example: Create some test data
    const tableName = process.env.DYNAMODB_TABLE || "TestTable";
    const testUuid = `test-${Date.now()}`;
    const testData = {
      uuid: testUuid,
      name: "Test Item",
      createdAt: new Date().toISOString(),
    };

    try {
      // Insert test data
      const putCommand = new PutCommand({
        TableName: tableName,
        Item: testData,
      });

      await ddb.send(putCommand);
      console.log(`✅ Created test data with UUID: ${testUuid}`);

      // Verify the data was created
      const getCommand = new GetCommand({
        TableName: tableName,
        Key: { uuid: testUuid },
      });

      const { Item } = await ddb.send(getCommand);
      assert.ok(Item, "Item should exist after creation");
      assert.strictEqual(Item.uuid, testUuid, "Item UUID should match");
      assert.strictEqual(Item.name, testData.name, "Item name should match");

      // Remove the created data
      await removeCreatedData(tableName, { uuid: testUuid });

      // Verify deletion
      const verifyCommand = new GetCommand({
        TableName: tableName,
        Key: { uuid: testUuid },
      });
      const { Item: deletedItem } = await ddb.send(verifyCommand);
      assert.strictEqual(deletedItem, undefined, "Item should be deleted");
    } catch (err) {
      console.error("❌ Test failed:", err);
      throw err;
    }
  });
});
