"use client";

import { useEffect, useRef, useState } from "react";

type Asset = { alt: string; id: string };

export function MediaUpload({ variantId }: { variantId?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (!variantId) return;
    void fetch(`/api/author/media?variantId=${variantId}`).then(
      async (response) => {
        if (response.ok) setAssets((await response.json()) as Asset[]);
      },
    );
  }, [variantId]);

  async function upload() {
    if (!variantId) {
      setError("请先保存草稿，再添加受管图片。");
      return;
    }
    const file = fileRef.current?.files?.[0];
    if (!file || !alt.trim()) {
      setError("请选择图片并填写替代文本。");
      return;
    }
    setUploading(true);
    setError(null);
    const body = new FormData();
    body.set("file", file);
    body.set("alt", alt);
    body.set("variantId", variantId);
    const response = await fetch("/api/author/media", { body, method: "POST" });
    const result = (await response.json()) as {
      error?: string;
      id?: string;
      markdown?: string;
    };
    setUploading(false);
    if (!response.ok || !result.markdown) {
      setError(result.error ?? "图片上传失败");
      return;
    }
    const markdown = document.querySelector<HTMLTextAreaElement>(
      'textarea[name="bodyMarkdown"]',
    );
    if (!markdown) return;
    markdown.value = `${markdown.value}${markdown.value ? "\n\n" : ""}${result.markdown}`;
    markdown.dispatchEvent(new Event("input", { bubbles: true }));
    const assetId = result.id;
    if (assetId)
      setAssets((current) => [...current, { alt: alt.trim(), id: assetId }]);
    setAlt("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function remove(assetId: string) {
    if (!variantId) return;
    const response = await fetch("/api/author/media", {
      body: JSON.stringify({ assetId, variantId }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE",
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "图片删除失败");
      return;
    }
    setAssets((current) => current.filter((asset) => asset.id !== assetId));
  }

  return (
    <fieldset className="border-line grid gap-3 rounded-lg border p-4">
      <legend className="px-1 text-sm font-semibold">添加受管图片</legend>
      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-label="选择图片"
        ref={fileRef}
        type="file"
      />
      <label className="grid gap-2 text-sm font-semibold">
        图片替代文本
        <input
          className="border-line bg-canvas rounded-lg border px-3 py-2"
          onChange={(event) => setAlt(event.target.value)}
          value={alt}
        />
      </label>
      {error ? (
        <p className="text-accent text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="border-line min-h-11 w-fit rounded-lg border px-4 py-2 font-semibold disabled:opacity-60"
        disabled={uploading}
        onClick={() => void upload()}
        type="button"
      >
        {uploading ? "上传中" : "上传并插入 Markdown"}
      </button>
      {assets.length ? (
        <ul className="grid gap-2 text-sm">
          {assets.map((asset) => (
            <li
              className="flex items-center justify-between gap-3"
              key={asset.id}
            >
              <span>{asset.alt}</span>
              <button
                className="text-accent underline"
                onClick={() => void remove(asset.id)}
                type="button"
              >
                删除未引用图片
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </fieldset>
  );
}
