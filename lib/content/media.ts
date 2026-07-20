import { createClient } from "@/lib/supabase/server";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { visit } from "unist-util-visit";

const bucket = "content-media";
const imageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export class MediaError extends Error {}

export function referencedManagedAssetIds(markdown: string, variantId: string) {
  const document = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const assetIds = new Set<string>();
  visit(document, "image", (node) => {
    const match = /^\/media\/([0-9a-f-]{36})\/([0-9a-f-]{36})$/.exec(node.url);
    if (match?.[1] === variantId) assetIds.add(match[2]);
  });
  return assetIds;
}

async function requireOwnDraftVariant(variantId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_variants")
    .select("id, body_markdown, state")
    .eq("id", variantId)
    .eq("state", "draft")
    .maybeSingle();
  if (error || !data) throw new MediaError("找不到自己的草稿");
  return { supabase, variant: data };
}

export async function uploadDraftImage(input: {
  alt: string;
  file: File;
  variantId: string;
}) {
  if (
    !imageTypes.has(input.file.type) ||
    input.file.size === 0 ||
    input.file.size > 5 * 1024 * 1024
  ) {
    throw new MediaError("图片必须是 5MB 以内的 JPEG、PNG、WebP 或 GIF");
  }
  if (!input.alt.trim() || input.alt.length > 300)
    throw new MediaError("图片必须提供可读的替代文本");
  const { supabase } = await requireOwnDraftVariant(input.variantId);
  const path = `author/${input.variantId}/${crypto.randomUUID()}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, input.file, { contentType: input.file.type, upsert: false });
  if (uploadError) throw new MediaError("图片上传失败");
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      alt: input.alt.trim(),
      byte_size: input.file.size,
      content_variant_id: input.variantId,
      mime_type: input.file.type,
      storage_path: path,
    })
    .select("id")
    .single();
  if (error) {
    await supabase.storage.from(bucket).remove([path]);
    throw new MediaError("图片保存失败");
  }
  return {
    id: data.id,
    markdown: `![${input.alt.trim()}](/media/${input.variantId}/${data.id})`,
  };
}

export async function deleteUnreferencedDraftImage(
  assetId: string,
  variantId: string,
) {
  const { supabase, variant } = await requireOwnDraftVariant(variantId);
  if (referencedManagedAssetIds(variant.body_markdown, variantId).has(assetId))
    throw new MediaError("图片仍被正文引用");
  const { data: asset, error } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", assetId)
    .eq("content_variant_id", variantId)
    .maybeSingle();
  if (error || !asset) throw new MediaError("找不到草稿媒体");
  const { error: markError } = await supabase
    .from("media_assets")
    .update({ deletion_pending_at: new Date().toISOString() })
    .eq("id", assetId)
    .eq("content_variant_id", variantId);
  if (markError) throw new MediaError("无法准备删除图片");
  const { count, error: countError } = await supabase
    .from("media_assets")
    .select("id", { count: "exact", head: true })
    .eq("storage_path", asset.storage_path)
    .neq("id", assetId);
  if (countError) throw new MediaError("无法确认图片引用");
  const { error: removeError } =
    count === 0
      ? await supabase.storage.from(bucket).remove([asset.storage_path])
      : { error: null };
  if (removeError) {
    await supabase
      .from("media_assets")
      .update({ deletion_pending_at: null })
      .eq("id", assetId)
      .eq("content_variant_id", variantId);
    throw new MediaError("图片删除失败");
  }
  const { error: deleteError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", assetId)
    .eq("content_variant_id", variantId);
  // If this fails, the pending record remains. A retry is safe because Storage remove is idempotent.
  if (deleteError) throw new MediaError("图片记录删除失败，请重试");
}

export async function listOwnDraftImages(variantId: string) {
  const { supabase } = await requireOwnDraftVariant(variantId);
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, alt")
    .eq("content_variant_id", variantId)
    .order("created_at");
  if (error) throw new MediaError("无法读取草稿图片");
  return data;
}
