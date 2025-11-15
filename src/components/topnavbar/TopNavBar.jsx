"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { isEmbedded } from "@utils/client/embed-context";
import NavigateButton from "@components/button/NavigateButton";
import SignOutButton from "@components/button/SignOutButton";
import {
  Plug,
  Settings,
  HelpCircle,
  LogOut,
  ChartSpline,
  CalendarSync,
} from "lucide-react";

function Btn({ type = "navigate", path, text, icon }) {
  if (type === "signout") {
    return (
      <SignOutButton
        className="clear_btn"
        text={icon ?? text ?? <LogOut size={20} strokeWidth={2} />}
        title="Sign Out"
        aria-label="Sign Out"
      />
    );
  }

  return (
    <NavigateButton
      path={path}
      className="clear_btn"
      title={`Go to ${path}`}
      text={icon ?? text}
      aria-label={text || path}
    />
  );
}

export default function TopNavBar() {
  const pathname = usePathname();
  const { data } = useSession();
  const role = data?.user?.role;
  const isAdmin = role === "admin";
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(isEmbedded());
  }, []);

  const isActive = (p) => p && (pathname === p || pathname.startsWith(p + "/"));
  const isRoot = pathname === "/";

  const BUTTONS = useMemo(() => {
    const profileButton = embedded
      ? {
          type: "navigate",
          path: "/embedded/profile",
          icon: <CalendarSync size={20} strokeWidth={2} />,
          side: "left",
        }
      : {
          type: "navigate",
          path: "/profile",
          icon: <CalendarSync size={20} strokeWidth={2} />,
          side: "left",
        };

    return [
      ...(isAdmin
        ? [
            {
              type: "navigate",
              path: "/admin",
              icon: <ChartSpline size={20} strokeWidth={2} />,
            },
          ]
        : []),
      profileButton,
      {
        type: "navigate",
        path: "/getting-started",
        icon: <Plug size={20} strokeWidth={2} />,
      },
      {
        type: "navigate",
        path: "/notion/config",
        icon: <Settings size={20} strokeWidth={2} />,
      },
      {
        type: "navigate",
        path: "/faq",
        icon: <HelpCircle size={20} strokeWidth={2} />,
      },
      ...(!isRoot
        ? [{ type: "signout", icon: <LogOut size={20} strokeWidth={2} /> }]
        : []),
    ];
  }, [embedded, isAdmin, isRoot]);

  // hide active page
  const filtered = BUTTONS.filter(
    (b) => b.type !== "navigate" || !isActive(b.path),
  );

  const left = filtered.filter((b) => b.side === "left");
  const right = filtered.filter((b) => b.side !== "left");

  if (!left.length && !right.length) return null;

  return (
    <nav className="top-section">
      <div className="top-section-left-items">
        {left.map((b) => (
          <Btn key={`L-${b.type}-${b.path ?? "auth"}`} {...b} />
        ))}
      </div>
      <div className="top-section-right-items">
        {right.map((b) => (
          <Btn key={`R-${b.type}-${b.path ?? "auth"}`} {...b} />
        ))}
      </div>
    </nav>
  );
}
