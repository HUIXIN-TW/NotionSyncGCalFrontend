import "server-only";

import logger from "@utils/shared/logger";
import { getAllUsers } from "@models/user";
import { getToken } from "next-auth/jwt";

const sanitize = (u) => {
  if (!u) return u;
  const { password, ...rest } = u;
  return rest;
};

export const GET = async (request) => {
  try {
    // AuthN: require a valid session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // AuthZ: only admin can list all users
    if (token.role !== "admin") {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
      });
    }

    // Fetch all users using the DynamoDB model
    const users = await getAllUsers();
    const safeUsers = users.map(sanitize);

    return new Response(JSON.stringify(safeUsers), { status: 200 });
  } catch (error) {
    logger.error("Error fetching users", error);
    return new Response("Failed to fetch all users", { status: 500 });
  }
};
