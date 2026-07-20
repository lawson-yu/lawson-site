"use client";

import { useState } from "react";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  }

  return (
    <div className="my-8 border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 text-xs">
        <span className="font-mono uppercase text-muted">{language}</span>
        <button
          className="min-h-11 px-2 font-semibold text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
          onClick={copyCode}
          type="button"
        >
          {copied ? "已复制" : "复制代码"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}
