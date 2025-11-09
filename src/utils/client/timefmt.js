"use client";

export default function timefmt(sec) {
  const n = Number(sec) || 0;
  if (n <= 0) return "0s";
  const m = Math.floor(n / 60);
  const s = n % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
