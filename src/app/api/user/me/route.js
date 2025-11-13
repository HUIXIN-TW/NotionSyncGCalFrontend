import "server-only";

import logger from "@utils/shared/logger";
import { getUserById } from "@models/user";
import { getToken } from "next-auth/jwt";

const sanitize = (u) => {
  if (!u) return u;
  const { password, ...rest } = u;
  return rest;
};

export const GET = async (request) => {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const uuid = token.uuid;
    if (!uuid || typeof uuid !== "string") {
      return new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 400,
      });
    }

    const user = await getUserById(uuid);
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(sanitize(user)), { status: 200 });
  } catch (error) {
    logger.error("Error fetching current user", error);
    return new Response("Failed to fetch the current user", { status: 500 });
  }
};
