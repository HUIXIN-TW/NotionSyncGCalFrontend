import { promises as fs } from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import styles from "./terms.module.css";

export const metadata = {
  title: "Terms of Service — NOTICA",
  description: "Terms of Service for NOTICA",
};

export default async function TermsPage() {
  const mdPath = path.join(process.cwd(), "TERMS.md");
  const content = await fs.readFile(mdPath, "utf8");

  return (
    <div className={styles.markdown}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
