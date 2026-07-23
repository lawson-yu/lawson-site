"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MediaUpload } from "./media-upload";

import type { CuratedProject } from "@/lib/content/curated";
import type { WorkspaceTag } from "@/lib/content/workspace";

export function CuratedForm({
  project,
  tags,
}: {
  project?: CuratedProject;
  tags: WorkspaceTag[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  async function submit(formData: FormData) {
    setSaving(true);
    setError(null);
    const response = await fetch(
      project ? `/api/author/curated/${project.id}` : "/api/author/curated",
      {
        method: project ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyMarkdown: formData.get("bodyMarkdown"),
          locale: "zh-CN",
          slug: formData.get("slug"),
          summary: formData.get("summary"),
          title: formData.get("title"),
          tagIds: formData.getAll("tagIds"),
          metadata: {
            collectedAt: formData.get("collectedAt"),
            commentary: formData.get("commentary"),
            problem: formData.get("problem"),
            sourceRepositoryUrl: formData.get("sourceRepositoryUrl"),
            useCases: formData.get("useCases"),
            week: formData.get("week"),
          },
        }),
      },
    );
    const result = (await response.json()) as { error?: string; id?: string };
    setSaving(false);
    if (!response.ok || !result.id) return setError(result.error ?? "保存失败");
    router.push(`/author/curated/${result.id}`);
    router.refresh();
  }
  const fields = [
    ["解决的问题", "problem", project?.metadata.problem, "textarea"],
    ["适用场景", "useCases", project?.metadata.useCases, "textarea"],
    ["作者短评", "commentary", project?.metadata.commentary, "textarea"],
  ] as const;
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
          className="border-line bg-canvas focus-visible:ring-brand rounded-md border px-3 py-3 outline-none focus-visible:ring-2"
          defaultValue={project?.title}
          maxLength={160}
          name="title"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        URL slug
        <input
          className="border-line bg-canvas focus-visible:ring-brand rounded-md border px-3 py-3 font-mono outline-none focus-visible:ring-2"
          defaultValue={project?.slug}
          maxLength={120}
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        摘要
        <textarea
          className="border-line bg-canvas focus-visible:ring-brand min-h-28 rounded-md border px-3 py-3 outline-none focus-visible:ring-2"
          defaultValue={project?.summary}
          maxLength={320}
          name="summary"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        来源仓库
        <input
          className="border-line bg-canvas focus-visible:ring-brand rounded-md border px-3 py-3 outline-none focus-visible:ring-2"
          defaultValue={project?.metadata.sourceRepositoryUrl}
          name="sourceRepositoryUrl"
          type="url"
          required
        />
      </label>
      {fields.map(([label, name, value, kind]) => (
        <label className="grid gap-2 text-sm font-semibold" key={name}>
          {label}
          {kind === "textarea" ? (
            <textarea
              className="border-line bg-canvas focus-visible:ring-brand min-h-28 rounded-md border px-3 py-3 outline-none focus-visible:ring-2"
              defaultValue={value}
              name={name}
              required
            />
          ) : null}
        </label>
      ))}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          收录日期
          <input
            className="border-line bg-canvas focus-visible:ring-brand rounded-md border px-3 py-3 outline-none focus-visible:ring-2"
            defaultValue={project?.metadata.collectedAt}
            name="collectedAt"
            type="date"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          周信息
          <input
            className="border-line bg-canvas focus-visible:ring-brand rounded-md border px-3 py-3 outline-none focus-visible:ring-2"
            defaultValue={project?.metadata.week}
            name="week"
            pattern="\d{4}-W\d{2}"
            placeholder="2026-W30"
            required
          />
        </label>
      </div>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold">标签</legend>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              className="border-line flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm"
              key={tag.id}
            >
              <input
                defaultChecked={project?.tags.some(({ id }) => id === tag.id)}
                name="tagIds"
                type="checkbox"
                value={tag.id}
              />
              {tag.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-2 text-sm font-semibold">
        精选说明（Markdown）
        <textarea
          className="border-line bg-canvas focus-visible:ring-brand min-h-96 rounded-md border px-3 py-3 font-mono text-sm outline-none focus-visible:ring-2"
          defaultValue={project?.bodyMarkdown}
          maxLength={50_000}
          name="bodyMarkdown"
          required
        />
      </label>
      <MediaUpload variantId={project?.id} />
      {error ? (
        <p className="text-accent text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="bg-action text-canvas focus-visible:ring-brand min-h-11 w-fit rounded-md px-5 py-3 font-bold outline-none focus-visible:ring-2 disabled:opacity-60"
        disabled={saving}
        type="submit"
      >
        {saving ? "保存中" : "保存草稿"}
      </button>
    </form>
  );
}
