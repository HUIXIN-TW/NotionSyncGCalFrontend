import { getUserById } from "@models/user";
import { connectToDatabase } from "@utils/db-connection";

export const GET = async (request, { params }) => {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch user by id using the DynamoDB model
    const userId = params.uuid;
    const user = await getUserById(userId);

    // If user not found, return 404
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response("Failed to fetch the user", { status: 500 });
  }
};
