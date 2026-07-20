"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BlogLifecycleActions({
  id,
  state,
}: {
  id: string;
  state: "draft" | "published";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  async function run(action: "edit" | "publish" | "unpublish") {
    setWorking(true);
    setError(null);
    const response = await fetch(`/api/author/blogs/${id}/${action}`, {
      method: "POST",
    });
    const result = (await response.json()) as { error?: string };
    setWorking(false);

    if (!response.ok) {
      setError(result.error ?? "操作失败");
      return;
    }

    if (action === "edit") {
      router.push(`/author/blog/${(result as { id: string }).id}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {state === "draft" ? (
        <button
          className="border-line text-ink min-h-11 rounded-lg border px-4 py-2 font-semibold"
          disabled={working}
          onClick={() => void run("publish")}
          type="button"
        >
          发布
        </button>
      ) : (
        <>
          <button
            className="border-line text-ink min-h-11 rounded-lg border px-4 py-2 font-semibold"
            disabled={working}
            onClick={() => void run("edit")}
            type="button"
          >
            创建编辑草稿
          </button>
          <button
            className="border-line text-ink min-h-11 rounded-lg border px-4 py-2 font-semibold"
            disabled={working}
            onClick={() => void run("unpublish")}
            type="button"
          >
            撤回为草稿
          </button>
        </>
      )}
      {error ? (
        <p className="text-accent text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
