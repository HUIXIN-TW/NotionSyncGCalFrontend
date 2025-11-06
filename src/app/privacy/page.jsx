import { promises as fs } from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import styles from "./privacy.module.css";

export const metadata = {
  title: "Privacy Policy — NOTICA",
  description: "Privacy Policy for NOTICA",
};

export default async function PrivacyPage() {
  const mdPath = path.join(process.cwd(), "PRIVACY.md");
  const content = await fs.readFile(mdPath, "utf8");

  return (
    <div className={styles.markdown}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
