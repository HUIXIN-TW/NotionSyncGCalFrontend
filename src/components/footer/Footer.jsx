"use client";

import { useSession } from "next-auth/react";

export default function Footer() {
  const { status } = useSession();

  if (status === "loading") return null;
  return <p>© 2025 Huixin Yang. All rights reserved.</p>;
}
