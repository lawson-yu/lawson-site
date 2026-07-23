"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "./code-block";

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, href }) => (
          <a
            className="text-brand decoration-brand/60 hover:decoration-brand underline underline-offset-4"
            href={href}
            rel="noreferrer"
            target={href?.startsWith("http") ? "_blank" : undefined}
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-accent text-ink my-8 border-l-2 pl-5 text-lg leading-8">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const language = className?.replace("language-", "");

          if (language) {
            return (
              <CodeBlock
                code={String(children).replace(/\n$/, "")}
                language={language}
              />
            );
          }

          return (
            <code className="bg-surface-raised text-action rounded px-1.5 py-0.5 font-mono text-sm">
              {children}
            </code>
          );
        },
        h1: ({ children }) => (
          <h2 className="mt-12 text-3xl font-medium tracking-tight">
            {children}
          </h2>
        ),
        h2: ({ children }) => (
          <h2 className="mt-12 text-3xl font-medium tracking-tight">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-8 text-xl font-semibold">{children}</h3>
        ),
        img: ({ alt, src }) => (
          // Markdown's image alt is preserved rather than inferred from the filename.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={alt || "内容图片"}
            className="border-line my-8 max-w-full rounded-md border"
            src={src}
          />
        ),
        p: ({ children }) => (
          <p className="text-muted my-6 text-lg leading-8">{children}</p>
        ),
        ol: ({ children }) => (
          <ol className="text-muted my-6 list-decimal space-y-2 pl-6 text-lg leading-8">
            {children}
          </ol>
        ),
        pre: ({ children }) => <>{children}</>,
        table: ({ children }) => (
          <div className="my-8 overflow-x-auto">
            <table className="border-line w-full border-collapse text-left text-sm">
              {children}
            </table>
          </div>
        ),
        td: ({ children }) => (
          <td className="border-line border p-3 align-top">{children}</td>
        ),
        th: ({ children }) => (
          <th className="border-line bg-surface-raised border p-3 font-semibold">
            {children}
          </th>
        ),
        ul: ({ children }) => (
          <ul className="text-muted my-6 list-disc space-y-2 pl-6 text-lg leading-8">
            {children}
          </ul>
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {markdown}
    </ReactMarkdown>
  );
}
