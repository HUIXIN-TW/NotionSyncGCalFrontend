import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
const ENV_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export async function GET(req) {
  const session = await getServerSession(authOptions);

  console.log('authOptions:', authOptions);
  console.log('Session:', session);
  console.log('Session UUID:', session?.user?.uuid);

  if (!session?.user?.uuid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Compute redirect URI: use env var or default to <origin>/api/google/callback
  const requestUrl = new URL(req.url);
  const origin = requestUrl.origin;
  const redirectUri = ENV_REDIRECT_URI || `${origin}/api/google/callback`;
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing Google OAuth client ID/secret env vars');
  }
  console.log('Using redirect URI:', redirectUri);
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: session.user.uuid, // Use the UUID as state to verify the callback
  });

  console.log("Generated auth URL:", authUrl);
  return new Response(JSON.stringify({ url: authUrl }), { status: 200 });
}
