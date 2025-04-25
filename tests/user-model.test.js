/**
 * User model test
 * Tests CRUD operations on the User model
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { v4 as uuidv4 } from "uuid";
import User from "../src/models/user.js";
import { connectToDatabase } from "../src/utils/db-connection.js";


describe("User Model Tests", async () => {
  it("should perform CRUD operations on user", async () => {
    try {
      // Ensure database connection
      await connectToDatabase();

      // Generate a unique test email and username
      const testEmail = `test.user+${uuidv4().slice(0, 8)}@example.com`;
      const testUsername = `testuser${uuidv4().slice(0, 8)}`; // Valid username: 8+ alphanumeric chars
      console.log("🔧 Testing with email:", testEmail);
      console.log("🔧 Testing with username:", testUsername);

      // 1. Create user
      console.log("\n1️⃣ Testing user creation...");
      const testUser = await User.create({
        email: testEmail,
        password: "supersecret123",
        username: testUsername, // Explicitly provide a valid username
      });
      assert.ok(testUser.uuid, "User should have UUID");
      assert.equal(testUser.email, testEmail, "User email should match");
      assert.equal(
        testUser.username,
        testUsername,
        "User username should match",
      );
      console.log("✅ Created user:", {
        uuid: testUser.uuid,
        email: testUser.email,
        username: testUser.username,
      });

      // 2. Get by ID
      console.log("\n2️⃣ Testing findById...");
      const getById = await User.findById(testUser.uuid);
      assert.ok(getById, "Should find user by ID");
      assert.equal(getById.uuid, testUser.uuid, "User IDs should match");
      console.log("✅ Got by ID:", {
        uuid: getById.uuid,
        email: getById.email,
      });

      // 3. Get by email
      console.log("\n3️⃣ Testing findOne...");
      const getByEmail = await User.findOne({ email: testEmail });
      assert.ok(getByEmail, "Should find user by email");
      assert.equal(getByEmail.email, testEmail, "User emails should match");
      console.log("✅ Got by email:", {
        uuid: getByEmail.uuid,
        email: getByEmail.email,
      });

      // 4. Update user
      console.log("\n4️⃣ Testing findByIdAndUpdate...");
      const testImage = "https://example.com/avatar.png";
      const updated = await User.findByIdAndUpdate(testUser.uuid, {
        image: testImage,
      });
      assert.ok(updated, "User should be updated");
      assert.equal(updated.image, testImage, "User image should be updated");
      console.log("✅ Updated user:", {
        uuid: updated.uuid,
        image: updated.image,
      });

      // 5. Delete user
      console.log("\n5️⃣ Testing findByIdAndDelete...");
      const deleted = await User.findByIdAndDelete(testUser.uuid);
      assert.ok(deleted, "User should be deleted");
      // Check if deleted is a success object or a user object
      if (deleted.success) {
        assert.ok(deleted.success, "Delete operation should be successful");
      } else {
        assert.equal(
          deleted.uuid,
          testUser.uuid,
          "Deleted user ID should match",
        );
      }
      console.log("✅ Deleted user:", deleted);

      // 6. Final check (should be undefined)
      console.log("\n6️⃣ Verifying deletion...");
      const shouldBeGone = await User.findById(testUser.uuid);
      assert.strictEqual(shouldBeGone, undefined, "User should not exist after deletion");
      console.log("✅ Get after delete (should be undefined):", shouldBeGone);

      console.log("\n✅ All User model tests completed successfully!");
    } catch (err) {
      console.error("❌ User model test failed:", err.message);
      throw err;
    }
  });
});
