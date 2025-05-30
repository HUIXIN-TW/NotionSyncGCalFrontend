import User from "@models/user";
import { connectToDatabase } from "@utils/db-connection";

export const GET = async (request) => {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch all users using the DynamoDB model
    const users = await User.find({});

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response("Failed to fetch all users", { status: 500 });
  }
};
