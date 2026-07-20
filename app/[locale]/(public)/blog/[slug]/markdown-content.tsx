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
            className="text-brand underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
            href={href}
            rel="noreferrer"
            target={href?.startsWith("http") ? "_blank" : undefined}
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-8 border-l-2 border-accent pl-5 text-lg leading-8 text-ink">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const language = className?.replace("language-", "");

          if (language) {
            return <CodeBlock code={String(children).replace(/\n$/, "")} language={language} />;
          }

          return (
            <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-sm text-action">
              {children}
            </code>
          );
        },
        h1: ({ children }) => <h2 className="mt-12 text-3xl font-bold">{children}</h2>,
        h2: ({ children }) => <h2 className="mt-12 text-3xl font-bold">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-8 text-xl font-bold">{children}</h3>,
        p: ({ children }) => <p className="my-6 leading-8 text-muted">{children}</p>,
        pre: ({ children }) => <>{children}</>,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {markdown}
    </ReactMarkdown>
  );
}
