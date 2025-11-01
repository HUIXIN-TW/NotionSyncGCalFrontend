import "server-only";
import { NextResponse } from "next/server";
import { registerCore } from "@/utils/server/register-core";
import logger from "@/utils/shared/logger";
import { enforceDDBThrottle, extractClientIp } from "@/utils/server/throttle";
import {
  registerIpRules,
  registerEmailRules,
} from "@/utils/server/throttle-rule";
import { normalizeEmail } from "@/utils/server/normalize-email";

// Keep a server action-compatible function for potential form actions
export const register = async (_prevState, formData) => {
  const { email, password, passwordRepeat, username, image } =
    Object.fromEntries(formData);
  return registerCore({ email, password, passwordRepeat, username, image });
};

// HTTP POST handler for /api/register
export async function POST(req) {
  try {
    const ip = extractClientIp(req) || null;
    if (!ip) {
      return NextResponse.json(
        { success: false, error: "Unable to determine client IP" },
        { status: 400 },
      );
    }
    const throttleResult = await enforceDDBThrottle(registerIpRules(ip));
    if (throttleResult) {
      return NextResponse.json(
        { success: false, ...throttleResult.body },
        { status: throttleResult.status },
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, password, passwordRepeat, username, image } = body || {};
    const normalizedEmail = normalizeEmail(email);

    // Per-identifier throttling (email)
    if (normalizedEmail) {
      const emailThrottle = await enforceDDBThrottle(
        registerEmailRules(normalizedEmail),
      );
      if (emailThrottle) {
        return NextResponse.json(
          { success: false, ...emailThrottle.body },
          { status: emailThrottle.status },
        );
      }
    }
    const result = await registerCore({
      email,
      password,
      passwordRepeat,
      username,
      image,
    });

    if (!result?.success) {
      const status =
        result?.reason === "validation"
          ? 400
          : result?.reason === "conflict"
            ? 409
            : 500;
      return NextResponse.json(
        { success: false, error: result?.error || "Registration failed" },
        { status },
      );
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.error("Registration error", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again later." },
      { status: 500 },
    );
  }
}
