import User from "@models/user";
import { connectToDatabase } from "@utils/database";

export const GET = async (request, { params }) => {
  try {
    // Connect to the database, and fetch all users
    await connectToDatabase();

    // Fetch user by id
    const userId = params.id;
    const user = await User.findById(userId);

    // If user not found, return 404
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch the uer", { status: 500 });
  }
};
