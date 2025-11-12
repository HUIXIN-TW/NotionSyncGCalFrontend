import logger from "@/utils/shared/logger";

const POPUP_FEATURES = "width=500,height=700,noopener,noreferrer";
const POPUP_NAME = "notica-auth";

export function isEmbedded() {
  try {
    return window.top !== window;
  } catch (err) {
    logger.warn("Unable to read window.top, assume embedded", err);
    return true;
  }
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
