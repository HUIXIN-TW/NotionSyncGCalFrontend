"use client";

import { usePathname } from "next/navigation";
import NavigateButton from "@/components/button/NavigateButton";
import { Plug, Settings, HelpCircle } from "lucide-react";

// button icon
function Btn({ path, text, icon }) {
  return (
    <NavigateButton
      path={path}
      className="clear_btn"
      text={icon ? { icon } : text}
    />
  );
}

export default function TopNavBar() {
  const pathname = usePathname();

  const COMMON_LEFT = [
    {
      path: "/profile",
      icon: <Plug size={20} strokeWidth={2} />,
    },
  ];

  const COMMON_RIGHT = [
    {
      path: "/getting-started",
      icon: <Plug size={20} strokeWidth={2} />,
    },
    {
      path: "/notion/config",
      icon: <Settings size={20} strokeWidth={2} />,
    },
    {
      path: "/faq",
      icon: <HelpCircle size={20} strokeWidth={2} />,
    },
  ];

  const CONFIG = {
    "/faq": {
      left: COMMON_LEFT,
      right: COMMON_RIGHT
    },
    "/profile": { right: COMMON_RIGHT },
    "/getting-started": { right: COMMON_RIGHT },
    "/notion/config": { right: COMMON_RIGHT },
  };

  // according to pathname to get left and right buttons
  const match = Object.keys(CONFIG).find(
    (k) => pathname === k || pathname.startsWith(k + "/"),
  );
  const { left = [], right = [] } = match
    ? CONFIG[match]
    : { left: [], right: [] };
  if (!left.length && !right.length) return null;

  return (
    <nav className="top-section">
      <div className="top-section-left-items">
        {left.map((b, i) => (
          <Btn key={`L-${i}`} {...b} />
        ))}
      </div>
      <div className="top-section-right-items">
        {right.map((b, i) => (
          <Btn key={`R-${i}`} {...b} />
        ))}
      </div>
    </nav>
  );
}
