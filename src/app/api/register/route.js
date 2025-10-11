import "server-only";  
import { NextResponse } from "next/server";
import { registerCore } from "@utils/register-core";
import logger from "@utils/logger";


// Keep a server action-compatible function for potential form actions
export const register = async (_prevState, formData) => {
  const { email, password, passwordRepeat, username, image } =
    Object.fromEntries(formData);
  return registerCore({ email, password, passwordRepeat, username, image });
};

// HTTP POST handler for /api/register
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, passwordRepeat, username, image } = body || {};
    const result = await registerCore({
      email,
      password,
      passwordRepeat,
      username,
      image,
    });

    if (!result?.success) {
      const status = result?.reason === "validation" ? 400 : result?.reason === "conflict" ? 409 : 500;
      return NextResponse.json({ success: false, error: result?.error || "Registration failed" }, { status });
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
