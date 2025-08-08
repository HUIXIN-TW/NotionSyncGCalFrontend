import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { google } from "googleapis";
import { uploadGoogleTokens } from "@utils/s3-client";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/profile?refresh=unauthorized", url));
  }

  // Log state and session UUID for debugging
  console.log(
    "OAuth callback state:",
    state,
    "Session UUID:",
    session.user.uuid,
  );
  if (state !== session.user.uuid) {
    console.warn("State mismatch, proceeding anyway");
  }

  // Compute redirect URI same as auth-url (use production URL if provided)
  const origin = url.origin;
  const baseUrl = process.env.NEXTAUTH_URL || origin;
  // Determine callback URL using production NEXTAUTH_URL or origin
  const callbackUri = `${baseUrl}/api/google/callback`;
  console.log("Callback using redirect URI:", callbackUri);
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    callbackUri,
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Received tokens:", tokens);
    await uploadGoogleTokens(session.user.uuid, tokens);
    console.log("Tokens uploaded successfully");
    return NextResponse.redirect(new URL("/profile", baseUrl));
  } catch (err) {
    console.error("OAuth callback error:", err);
    console.log("Error details:", err.response?.data || err.message);
    return NextResponse.redirect(new URL("/profile", baseUrl));
  }
}
