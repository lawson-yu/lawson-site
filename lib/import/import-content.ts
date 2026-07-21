import { createImportExecutorClient } from "@/lib/supabase/import-executor";

import { rewriteImportedImageUrls, type ImportPackage } from "./contract";

const bucket = "content-media";

export class ImportExecutionError extends Error {}

type PreparedImport = {
  content_item_id: string;
  draft_variant_id: string | null;
  import_batch_id: string | null;
  import_source_id: string;
  result: "created" | "updated" | "unchanged";
};

async function removeAndAcknowledge(
  supabase: ReturnType<typeof createImportExecutorClient>,
  paths: string[],
) {
  if (!paths.length) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (!error) await supabase.rpc("complete_import_cleanup", { paths });
}

export async function importContent(input: ImportPackage) {
  const supabase = createImportExecutorClient();
  const { data: pendingCleanup } = await supabase.rpc(
    "pending_import_cleanup_paths",
  );
  await removeAndAcknowledge(
    supabase,
    (pendingCleanup as string[] | null) ?? [],
  );
  const { data, error } = await supabase.rpc("prepare_import_draft", {
    import_body_markdown: input.bodyMarkdown,
    import_digest: input.digest,
    import_external_id: input.externalId,
    import_kind: input.kind,
    import_locale: input.locale,
    import_metadata: input.metadata,
    import_slug: input.slug,
    import_summary: input.summary,
    import_tags: input.tags,
    import_title: input.title,
  });
  const prepared = (data as PreparedImport[] | null)?.[0];
  if (
    error ||
    !prepared ||
    !prepared.draft_variant_id ||
    (prepared.result !== "unchanged" && !prepared.import_batch_id)
  )
    throw new ImportExecutionError("无法准备导入草稿");

  if (prepared.result === "unchanged") {
    return {
      contentItemId: prepared.content_item_id,
      draftVariantId: prepared.draft_variant_id,
      result: prepared.result,
    };
  }
  const batchId = prepared.import_batch_id;
  if (!batchId) throw new ImportExecutionError("无法准备导入草稿");

  const uploaded: Array<{ assetId: string; path: string }> = [];
  try {
    const managedUrls = new Map<string, string>();
    for (const image of input.images) {
      const assetId = crypto.randomUUID();
      const storagePath = `imports/${prepared.draft_variant_id}/${assetId}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, image.file, {
          contentType: image.file.type,
          upsert: false,
        });
      if (uploadError) throw new ImportExecutionError("无法保存导入图片");
      const { error: assetError } = await supabase.from("media_assets").insert({
        alt: image.alt,
        byte_size: image.file.size,
        content_variant_id: prepared.draft_variant_id,
        id: assetId,
        import_batch_id: batchId,
        import_source_id: prepared.import_source_id,
        mime_type: image.file.type,
        source_path: image.path,
        storage_path: storagePath,
      });
      if (assetError) {
        await supabase.storage.from(bucket).remove([storagePath]);
        throw new ImportExecutionError("无法记录导入图片");
      }
      uploaded.push({ assetId, path: storagePath });
      managedUrls.set(
        image.path,
        `/media/${prepared.draft_variant_id}/${assetId}`,
      );
    }
    const bodyMarkdown = rewriteImportedImageUrls(
      input.bodyMarkdown,
      managedUrls,
    );
    const { data: staleStoragePaths, error: completeError } =
      await supabase.rpc("complete_import_draft", {
        batch_id: batchId,
        draft_id: prepared.draft_variant_id,
        import_digest: input.digest,
        rewritten_body_markdown: bodyMarkdown,
        source_id: prepared.import_source_id,
      });
    if (completeError) throw new ImportExecutionError("无法完成导入");
    await removeAndAcknowledge(supabase, staleStoragePaths ?? []);
    return {
      contentItemId: prepared.content_item_id,
      draftVariantId: prepared.draft_variant_id,
      result: prepared.result,
    };
  } catch (error) {
    const { data: rollbackPaths } = await supabase.rpc(
      "rollback_import_draft",
      {
        batch_id: batchId,
        draft_id: prepared.draft_variant_id,
        source_id: prepared.import_source_id,
      },
    );
    const paths = new Set([
      ...uploaded.map((asset) => asset.path),
      ...((rollbackPaths as string[] | null) ?? []),
    ]);
    await removeAndAcknowledge(supabase, [...paths]);
    if (error instanceof ImportExecutionError) throw error;
    throw new ImportExecutionError("导入失败");
  }
}
