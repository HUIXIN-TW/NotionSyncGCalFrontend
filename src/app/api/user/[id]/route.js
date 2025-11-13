import "server-only";

import logger from "@utils/shared/logger";
import { getUserById } from "@models/user";
import { getToken } from "next-auth/jwt";

const sanitize = (u) => {
  if (!u) return u;
  const { password, ...rest } = u;
  return rest;
};

export const GET = async (request, { params }) => {
  try {
    // AuthN
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // Fetch user by id using the DynamoDB model
    const userId = params.uuid;
    const user = await getUserById(userId);

    // If user not found, return 404
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // AuthZ: only the same user (owner) or admin can read
    if (token.role !== "admin" && token.uuid !== user.uuid) {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify(sanitize(user)), { status: 200 });
  } catch (error) {
    logger.error("Error fetching user", error);
    return new Response("Failed to fetch the user", { status: 500 });
  }
};
