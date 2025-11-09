import { NextResponse } from "next/server";

export function middleware(req) {
  // Only write on authentication-related paths; or keep matcher but do not reset if already exists
  const url = req.nextUrl.pathname;
  const shouldStamp = url.startsWith("/api/auth");

  const existing = req.cookies.get("client_ip")?.value;
  if (!shouldStamp && existing) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown";

  const res = NextResponse.next();
  if (!existing || existing !== ip) {
    res.cookies.set("client_ip", ip, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60, // 10 minutes to avoid long-term carrying
    });
  }
  return res;
}

export const config = {
  // apply middleware to all paths except for _next, static files, and favicon.ico
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
