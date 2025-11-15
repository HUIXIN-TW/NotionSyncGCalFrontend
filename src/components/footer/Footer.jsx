"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

const formatBuildVersion = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return `v.${isoString}`;
  const pad = (value) => `${value}`.padStart(2, "0");
  return `v.${date.getUTCFullYear()}.${pad(date.getUTCMonth() + 1)}.${pad(
    date.getUTCDate(),
  )}.${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}Z`;
};

export default function Footer() {
  const { status } = useSession();

  const buildVersion = useMemo(
    () => formatBuildVersion(process.env.NEXT_PUBLIC_BUILD_VERSION),
    [],
  );

  if (status === "loading") return null;

  return (
    <div className="footer-content">
      <span>© 2025 Huixin Yang. All rights reserved.</span>
      {buildVersion && (
        <span className="footer-version" title="Current deployment version">
          {buildVersion}
        </span>
      )}
    </div>
  );
}
