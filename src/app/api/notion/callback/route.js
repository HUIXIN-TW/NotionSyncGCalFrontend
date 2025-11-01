import logger from "@/utils/shared/logger";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { uploadNotionTokens } from "@/utils/server/s3-client";

function clearState(res) {
  res.cookies.set("notion_oauth_state", "", { maxAge: 0, path: "/" });
}

export async function GET(req) {
  const url = new URL(req.url);
  const BaseUrl = process.env.NEXTAUTH_URL;
  if (!BaseUrl)
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  const redirectUri = `${BaseUrl}/api/notion/callback`;
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const oauthErr = url.searchParams.get("error");
  const session = await getServerSession(authOptions);
  const redirectTarget = session.isNewUser
    ? "/getting-started"
    : "/notion/config";

  if (oauthErr || !code) {
    logger.error("OAuth error", { error: oauthErr });
    const res = NextResponse.redirect(
      new URL(`${redirectTarget}?notion=error`, BaseUrl),
    );
    clearState(res);
    return res;
  }

  const jar = await cookies();
  const expectedState = jar.get("notion_oauth_state")?.value ?? "";
  const codeVerifier = jar.get("google_code_verifier")?.value ?? "";

  if (!returnedState || returnedState !== expectedState) {
    logger.error("State mismatch");
    const res = NextResponse.redirect(
      new URL(`${redirectTarget}?notion=error&reason=state`, BaseUrl),
    );
    clearState(res);
    return res;
  }

  // check user uuid
  const [userUuid] = returnedState.split(":");
  if (!userUuid) {
    logger.error("Missing user uuid in state");
    const res = NextResponse.redirect(
      new URL(`${redirectTarget}?notion=error&reason=uuid`, BaseUrl),
    );
    clearState(res);
    return res;
  }

  try {
    // exchange token
    const basic = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      logger.error("Token exchange failed", {
        status: tokenRes.status,
        body: await tokenRes.text(),
      });
      const res = NextResponse.redirect(
        new URL(`${redirectTarget}?notion=error&reason=token`, BaseUrl),
      );
      clearState(res);
      return res;
    }

    const { access_token, bot_id, workspace_id, workspace_name, owner } =
      tokenJson;

    // upload to S3
    await uploadNotionTokens(userUuid, {
      provider: "notion",
      stored_at: new Date().toISOString(),
      user_uuid: userUuid,
      access_token,
      bot_id,
      workspace_id,
      workspace_name,
      owner,
    });

    // clear state cookie and redirect
    const res = NextResponse.redirect(
      new URL(
        `${redirectTarget}?notion=connected&workspace=${encodeURIComponent(workspace_name || workspace_id || "ok")}`,
        BaseUrl,
      ),
    );
    clearState(res);
    return res;
  } catch (e) {
    logger.error("Callback error", { message: e?.message });
    const res = NextResponse.redirect(
      new URL(`${redirectTarget}?notion=error&reason=server`, BaseUrl),
    );
    clearState(res);
    return res;
  }
}
