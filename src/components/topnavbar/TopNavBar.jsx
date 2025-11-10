"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import NavigateButton from "@/components/button/NavigateButton";
import SignOutButton from "@/components/button/SignOutButton";
import {
  Plug,
  Settings,
  HelpCircle,
  CircleUserRound,
  LogOut,
  BarChart3,
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

  const isActive = (p) => p && (pathname === p || pathname.startsWith(p + "/"));
  const isRoot = pathname === "/";

  const BUTTONS = [
    {
      type: "navigate",
      path: "/profile",
      icon: <CircleUserRound size={20} strokeWidth={2} />,
      side: "left",
    },
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
    ...(isAdmin
      ? [
          {
            type: "navigate",
            path: "/admin",
            icon: <BarChart3 size={20} strokeWidth={2} />,
          },
        ]
      : []),
    ...(!isRoot
      ? [{ type: "signout", icon: <LogOut size={20} strokeWidth={2} /> }]
      : []),
  ];

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
