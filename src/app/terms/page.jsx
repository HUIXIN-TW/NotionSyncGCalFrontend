import "server-only";

import { promises as fs } from "fs";
import path from "path";
import MarkdownRenderer from "@components/markdown/MarkdownRenderer";

export const metadata = {
  title: "Terms of Service — NOTICA",
  description: "Terms of Service for NOTICA",
};

// use static generation for FAQ page
export const revalidate = false; // or：export const dynamic = "force-static";

export default async function TermsPage() {
  const mdPath = path.join(process.cwd(), "TERMS.md");
  const content = await fs.readFile(mdPath, "utf8");

  return (
    <div>
      <MarkdownRenderer content={content} />
    </div>
  );
}
