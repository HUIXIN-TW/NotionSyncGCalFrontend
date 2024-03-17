import User from "@models/user";
import { connectToDatabase } from "@utils/database";

export const GET = async (request) => {
  try {
    // Connect to the database, and fetch all users
    await connectToDatabase();

    // Fetch all users
    const users = await User.find({});

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch all uers", { status: 500 });
  }
};
