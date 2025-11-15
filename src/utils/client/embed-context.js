import logger from "@utils/shared/logger";

const POPUP_FEATURES = "width=500,height=700,noopener,noreferrer";
const POPUP_NAME = "notica-auth";
// Notion-iOS/241.5.6
// Notion-Android/2024.11.3
const NOTION_MOBILE_UA_PATTERN = /Notion-(Android|iOS)/i; // regex to match Notion mobile app user agents

export function isEmbedded() {
  try {
    return window.top !== window;
  } catch (err) {
    logger.warn("Unable to read window.top, assume embedded", err);
    return true;
  }
}

export function isNotionMobileApp(userAgentOverride) {
  const uaSource =
    // Use override if provided, otherwise use navigator.userAgent if available
    typeof userAgentOverride === "string" && userAgentOverride.length > 0
      ? userAgentOverride
      : typeof navigator !== "undefined"
        ? navigator.userAgent || ""
        : "";

  if (!uaSource) {
    return false;
  }

  const isNotionMobileUserAgent = NOTION_MOBILE_UA_PATTERN.test(uaSource);
  return isNotionMobileUserAgent;
}

export function buildSignInUrl(callbackPath) {
  const origin = window.location.origin;
  const callback = new URL(callbackPath, origin).toString();
  const url = new URL("/api/auth/signin/google", origin);
  url.searchParams.set("callbackUrl", callback);
  return url.toString();
}

export function openAuthWindow(authUrl) {
  if (!authUrl) return false;
  const popup = window.open(authUrl, POPUP_NAME, POPUP_FEATURES);
  if (!popup) {
    alert("Please allow pop-up windows to continue with Google sign-in.");
    return false;
  }
  return true;
}
