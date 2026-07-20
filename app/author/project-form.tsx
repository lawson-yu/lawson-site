"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MediaUpload } from "./media-upload";

import type { Project } from "@/lib/content/projects";
import type { WorkspaceTag } from "@/lib/content/workspace";

export function ProjectForm({
  project,
  tags,
}: {
  project?: Project;
  tags: WorkspaceTag[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  async function submit(formData: FormData) {
    setSaving(true);
    setError(null);
    const response = await fetch(
      project ? `/api/author/projects/${project.id}` : "/api/author/projects",
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
            coverImageUrl: formData.get("coverImageUrl") || null,
            problem: formData.get("problem"),
            outcomes: formData.get("outcomes"),
            featured: formData.get("featured") === "on",
            techStack: String(formData.get("techStack"))
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            repositoryUrl: formData.get("repositoryUrl"),
            demoUrl: formData.get("demoUrl") || null,
          },
        }),
      },
    );
    const result = (await response.json()) as { error?: string; id?: string };
    setSaving(false);
    if (!response.ok || !result.id) return setError(result.error ?? "保存失败");
    router.push(`/author/project/${result.id}`);
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
          className="border-line bg-canvas rounded-lg border px-3 py-3"
          defaultValue={project?.title}
          maxLength={160}
          name="title"
          required
        />
      </label>
      <MediaUpload variantId={project?.id} />
      <label className="grid gap-2 text-sm font-semibold">
        URL slug
        <input
          className="border-line bg-canvas rounded-lg border px-3 py-3 font-mono"
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
          className="border-line bg-canvas min-h-28 rounded-lg border px-3 py-3"
          defaultValue={project?.summary}
          maxLength={320}
          name="summary"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        问题
        <textarea
          className="border-line bg-canvas min-h-28 rounded-lg border px-3 py-3"
          defaultValue={project?.metadata.problem}
          name="problem"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        成果
        <textarea
          className="border-line bg-canvas min-h-28 rounded-lg border px-3 py-3"
          defaultValue={project?.metadata.outcomes}
          name="outcomes"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        技术栈（用逗号分隔）
        <input
          className="border-line bg-canvas rounded-lg border px-3 py-3"
          defaultValue={project?.metadata.techStack.join(", ")}
          name="techStack"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        代码仓库
        <input
          className="border-line bg-canvas rounded-lg border px-3 py-3"
          defaultValue={project?.metadata.repositoryUrl}
          name="repositoryUrl"
          type="url"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        演示链接（可选）
        <input
          className="border-line bg-canvas rounded-lg border px-3 py-3"
          defaultValue={project?.metadata.demoUrl ?? ""}
          name="demoUrl"
          type="url"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        封面链接（可选）
        <input
          className="border-line bg-canvas rounded-lg border px-3 py-3"
          defaultValue={project?.metadata.coverImageUrl ?? ""}
          name="coverImageUrl"
          type="url"
        />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
        <input
          defaultChecked={project?.metadata.featured}
          name="featured"
          type="checkbox"
        />
        置顶展示
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
        项目说明（Markdown）
        <textarea
          className="border-line bg-canvas min-h-96 rounded-lg border px-3 py-3 font-mono text-sm"
          defaultValue={project?.bodyMarkdown}
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
