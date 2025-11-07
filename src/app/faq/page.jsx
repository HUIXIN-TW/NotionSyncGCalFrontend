import { promises as fs } from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import styles from "./faq.module.css";

export const metadata = {
  title: "FAQ — NOTICA",
  description: "Frequently Asked Questions for NOTICA",
};

export default async function FaqPage() {
  const mdPath = path.join(process.cwd(), "faq.md");
  const content = await fs.readFile(mdPath, "utf8");

  return (
    <div className={styles.markdown}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
