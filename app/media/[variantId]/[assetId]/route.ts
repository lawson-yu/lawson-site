import { NextResponse } from "next/server";
import { getAuthorIdentity } from "@/lib/author/identity";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ variantId: string; assetId: string }> },
) {
  const { assetId, variantId } = await params;
  const viewer = await getAuthorIdentity();
  const client = await createClient();
  const { data: asset } = await client
    .from("media_assets")
    .select(
      "storage_path, content_variants!inner(state, content_items!inner(author_id))",
    )
    .eq("id", assetId)
    .eq("content_variant_id", variantId)
    .maybeSingle();
  const variant = asset?.content_variants as unknown as {
    state: string;
    content_items: { author_id: string };
  } | null;
  if (
    !asset ||
    !variant ||
    (variant.state !== "published" &&
      (!viewer ||
        variant.state !== "draft" ||
        variant.content_items.author_id !== viewer.userId))
  )
    return new NextResponse(null, { status: 404 });
  const { data, error } = await client.storage
    .from("content-media")
    .createSignedUrl(asset.storage_path, 60);
  if (error || !data) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(data.signedUrl, {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}
