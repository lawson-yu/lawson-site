"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { WorkspaceBlog, WorkspaceTag } from "@/lib/content/workspace";

type BlogFormProps = {
  blog?: WorkspaceBlog;
  tags: WorkspaceTag[];
};

export function BlogForm({ blog, tags }: BlogFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    setError(null);
    const tagIds = formData
      .getAll("tagIds")
      .filter((value): value is string => typeof value === "string");
    const response = await fetch(
      blog ? `/api/author/blogs/${blog.id}` : "/api/author/blogs",
      {
        body: JSON.stringify({
          bodyMarkdown: formData.get("bodyMarkdown"),
          locale: "zh-CN",
          slug: formData.get("slug"),
          summary: formData.get("summary"),
          tagIds,
          title: formData.get("title"),
        }),
        headers: { "Content-Type": "application/json" },
        method: blog ? "PATCH" : "POST",
      },
    );
    const result = (await response.json()) as { error?: string; id?: string };

    setSaving(false);
    if (!response.ok || !result.id) {
      setError(result.error ?? "保存失败");
      return;
    }

    router.push(`/author/blog/${result.id}`);
    router.refresh();
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
    >
      <label className="grid gap-2 text-sm font-semibold">
        标题
        <input
          className="border-line bg-canvas text-ink focus-visible:ring-brand rounded-lg border px-3 py-3 outline-none focus-visible:ring-2"
          defaultValue={blog?.title}
          maxLength={160}
          name="title"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        URL slug
        <input
          className="border-line bg-canvas text-ink focus-visible:ring-brand rounded-lg border px-3 py-3 font-mono outline-none focus-visible:ring-2"
          defaultValue={blog?.slug}
          maxLength={120}
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        摘要
        <textarea
          className="border-line bg-canvas text-ink focus-visible:ring-brand min-h-28 rounded-lg border px-3 py-3 outline-none focus-visible:ring-2"
          defaultValue={blog?.summary}
          maxLength={320}
          name="summary"
          required
        />
      </label>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold">标签</legend>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              className="border-line flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-sm"
              key={tag.id}
            >
              <input
                defaultChecked={blog?.tags.some(({ id }) => id === tag.id)}
                name="tagIds"
                type="checkbox"
                value={tag.id}
              />
              {tag.label}
              {tag.state === "pending" ? (
                <span className="text-muted">待确认</span>
              ) : null}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-2 text-sm font-semibold">
        Markdown 正文
        <textarea
          className="border-line bg-canvas text-ink focus-visible:ring-brand min-h-96 rounded-lg border px-3 py-3 font-mono text-sm leading-7 outline-none focus-visible:ring-2"
          defaultValue={blog?.bodyMarkdown}
          maxLength={50_000}
          name="bodyMarkdown"
          required
        />
      </label>
      {error ? (
        <p className="text-accent text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="bg-action text-canvas min-h-11 w-fit rounded-lg px-5 py-3 font-bold disabled:opacity-60"
        disabled={saving}
        type="submit"
      >
        {saving ? "保存中" : "保存草稿"}
      </button>
    </form>
  );
}
