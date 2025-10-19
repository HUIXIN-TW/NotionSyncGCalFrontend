import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import logger from "@utils/logger";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "openid",
  "email",
  "profile",
];

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const uuid = session?.user?.uuid;
  if (!uuid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const nonce = crypto.randomUUID();
  const state = `${uuid}:${nonce}`;

  const codeVerifier = crypto.randomUUID().replace(/-/g, "");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  const codeChallenge = Buffer.from(digest)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const origin = new URL(req.url).origin;
  const baseUrl = process.env.NEXTAUTH_URL || origin;
  const redirectUri = `${baseUrl}/api/google/callback`;
  logger.debug("Redirect URI for Google OAuth:", redirectUri);

  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", CLIENT_ID);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", SCOPES.join(" "));
  u.searchParams.set("access_type", "offline");
  u.searchParams.set("include_granted_scopes", "true");
  u.searchParams.set("state", state);
  u.searchParams.set("prompt", "consent");
  u.searchParams.set("code_challenge", codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  logger.debug("Google OAuth URL:", u.toString());
  logger.sensitive("State:", state, "Code Verifier:", codeVerifier);

  const res = NextResponse.json({ url: u.toString() });
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 600,
  });
  res.cookies.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 600,
  });
  return res;
}
