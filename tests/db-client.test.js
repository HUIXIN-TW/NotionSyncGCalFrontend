import { describe, it } from "node:test";
import assert from "node:assert";
import dbClientModule from "../src/utils/db-client.js"; // <-- CJS import fix
const { ddb } = dbClientModule;
import { PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

async function removeCreatedData(tableName, key) {
  try {
    const result = await ddb.send(
      new DeleteCommand({ TableName: tableName, Key: key }),
    );
    return result;
  } catch (err) {
    console.error(`❌ Error removing test data:`, err);
    throw err;
  }
}

describe("DynamoDB Client Tests", () => {
  it("should perform basic CRUD operations", async () => {
    const tableName = process.env.DYNAMODB_TABLE;
    if (!tableName) throw new Error("Missing DYNAMODB_TABLE env var");

    const testUuid = `test-${Date.now()}`;
    const testData = {
      uuid: testUuid,
      name: "Test Item",
      createdAt: new Date().toISOString(),
    };

    // Insert test data
    await ddb.send(new PutCommand({ TableName: tableName, Item: testData }));

    // Verify insert
    const { Item } = await ddb.send(
      new GetCommand({ TableName: tableName, Key: { uuid: testUuid } }),
    );
    assert.ok(Item);
    assert.strictEqual(Item.uuid, testUuid);
    assert.strictEqual(Item.name, testData.name);

    // Delete test data
    await removeCreatedData(tableName, { uuid: testUuid });

    // Verify deletion
    const { Item: deleted } = await ddb.send(
      new GetCommand({ TableName: tableName, Key: { uuid: testUuid } }),
    );
    assert.strictEqual(deleted, undefined);
  });
});
