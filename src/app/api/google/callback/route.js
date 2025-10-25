import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { uploadGoogleTokens } from "@/utils/server/s3-client";
import logger from "@/utils/shared/logger";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(req) {
  const url = new URL(req.url);
  const BaseUrl = process.env.NEXTAUTH_URL;
  if (!BaseUrl)
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  const code = url.searchParams.get("code");
  const returned = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  // check error
  if (err || !code) {
    return NextResponse.redirect(
      new URL("/notion/config?google=error", BaseUrl),
    );
  }

  // verify uuid, state, code_verifier
  const session = await getServerSession(authOptions);
  if (!session?.user?.uuid || !session?.user?.email) {
    return NextResponse.redirect(
      new URL("/notion/config?google=error&reason=unauthorized", BaseUrl),
    );
  }
  const allowedEmail = session.user.email.toLowerCase();

  // verify state & code_verifier
  const jar = await cookies();
  const expected = jar.get("google_oauth_state")?.value || "";
  const codeVerifier = jar.get("google_code_verifier")?.value || "";
  if (!returned || returned !== expected || !codeVerifier) {
    return NextResponse.redirect(
      new URL("/notion/config?google=error&reason=state", BaseUrl),
    );
  }
  const [userUuid] = returned.split(":");
  if (!userUuid) {
    return NextResponse.redirect(
      new URL("/notion/config?google=error&reason=uuid", BaseUrl),
    );
  }

  // exchange token & fetch userinfo
  try {
    const tokenBody = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: `${BaseUrl}/api/google/callback`,
    });

    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody,
    });
    const t = await tokenResp.json();
    if (!tokenResp.ok) {
      logger.error("Google token exchange failed", t);
      return NextResponse.redirect(
        new URL("/notion/config?google=error&reason=token", BaseUrl),
      );
    }

    // compare email with allowed email
    const uiResp = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${t.access_token}` },
      },
    );
    const profile = await uiResp.json();
    if (!uiResp.ok) {
      logger.error("Failed to fetch userinfo", profile);
      return NextResponse.redirect(
        new URL("/notion/config?google=error&reason=userinfo", BaseUrl),
      );
    }
    const googleEmail = (profile.email || "").toLowerCase();
    if (googleEmail !== allowedEmail) {
      logger.warn("Email mismatch", { googleEmail, allowedEmail });
      return NextResponse.redirect(
        new URL("/notion/config?google=error&reason=email_mismatch", BaseUrl),
      );
    }

    // store tokens
    await uploadGoogleTokens(
      userUuid,
      profile.id || null, // sub
      googleEmail, // email
      {
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        expiry_date: Date.now() + (t.expires_in || 0) * 1000,
        scope: t.scope,
      },
      new Date().toISOString(),
    );

    // clean up cookies & redirect
    const res = NextResponse.redirect(
      new URL("/notion/config?google=connected", BaseUrl),
    );
    res.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });
    res.cookies.set("google_code_verifier", "", { maxAge: 0, path: "/" });
    return res;
  } catch (e) {
    logger.error("OAuth callback error", e);
    return NextResponse.redirect(
      new URL("/notion/config?google=error&reason=server", BaseUrl),
    );
  }
}
