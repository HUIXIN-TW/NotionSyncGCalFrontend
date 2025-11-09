"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import styles from "./markdown.module.css";

export default function MarkdownRenderer({ content }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug, // ← 自動為標題產生 id（GitHub 風格）
          [rehypeAutolinkHeadings, { behavior: "append" }], // 可選：在標題末尾附錨點
        ]}
        components={{
          table: ({ node, ...props }) => (
            <div className={styles.tableWrapper}>
              <table {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th scope="col" {...props} />,
          a: ({ href = "", children, ...props }) => {
            if (href.startsWith("#")) {
              return (
                <a
                  {...props}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.querySelector(
                      decodeURIComponent(href),
                    );
                    if (target) {
                      target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      history.pushState(null, "", href);
                    }
                  }}
                >
                  {children}
                </a>
              );
            }
            return (
              <a
                {...props}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
