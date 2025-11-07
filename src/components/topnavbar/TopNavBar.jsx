"use client";

import { usePathname } from "next/navigation";
import NavigateButton from "@/components/button/NavigateButton";
import styles from "./topnavbar.module.css";

export default function TopNavBar() {
  const pathname = usePathname();

  return (
    <>
      {pathname === "/faq" ? (
        <div className={styles["header-left-bar"]}>
          <NavigateButton path="/profile" className="clear_btn" />
        </div>
      ) : (
        <div className={styles["header-right-bar"]}>
          <NavigateButton text="FAQ" path="/faq" className="clear_btn" />
        </div>
      )}
    </>
  );
}
