import { NextResponse } from "next/server";

function json(status, body) {
  return NextResponse.json(body, { status });
}

// 2xx
export const ok = (data, message) =>
  json(200, {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });

export const created = (data, message) =>
  json(201, {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });

// 4xx
export const badRequest = (message = "Bad Request", extra = {}) =>
  json(400, { success: false, type: "validation error", message, ...extra });

export const unauthorized = (message = "Unauthorized", extra = {}) =>
  json(401, { success: false, type: "auth error", message, ...extra });

export const forbidden = (message = "Forbidden", extra = {}) =>
  json(403, { success: false, type: "auth error", message, ...extra });

export const notFound = (message = "Not Found", extra = {}) =>
  json(404, { success: false, type: "not found", message, ...extra });

export const conflict = (message = "Conflict", extra = {}) =>
  json(409, { success: false, type: "conflict", message, ...extra });

export const tooMany = (message = "Too Many Requests", extra = {}) =>
  json(429, { success: false, type: "throttle error", message, ...extra });

// 5xx
export const serverError = (message = "Internal Server Error", extra = {}) =>
  json(500, { success: false, type: "server error", message, ...extra });

// Generic
export const respond = (status, payload) => json(status, payload);
