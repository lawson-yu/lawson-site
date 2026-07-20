alter table public.media_assets drop constraint media_assets_storage_path_key;
create index media_assets_storage_path_index on public.media_assets (storage_path);

create function public.copy_media_assets_to_draft(source_variant_id uuid, target_variant_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare source_asset public.media_assets; draft_asset_id uuid; draft_body text;
begin
  select body_markdown into draft_body from public.content_variants where id = target_variant_id;
  for source_asset in select * from public.media_assets where content_variant_id = source_variant_id loop
    insert into public.media_assets (content_variant_id, storage_path, alt, mime_type, byte_size)
    values (target_variant_id, source_asset.storage_path, source_asset.alt, source_asset.mime_type, source_asset.byte_size)
    returning id into draft_asset_id;
    draft_body := replace(draft_body, '/media/' || source_variant_id || '/' || source_asset.id, '/media/' || target_variant_id || '/' || draft_asset_id);
  end loop;
  update public.content_variants set body_markdown = draft_body where id = target_variant_id;
end;
$$;

create or replace function public.create_blog_edit_draft(published_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare published public.content_variants; draft_variant_id uuid;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into published from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = published_variant_id and variant.state = 'published' and item.kind = 'blog' and item.author_id = (select auth.uid());
  if not found then raise exception 'published blog not found'; end if;
  insert into public.content_variants (content_item_id, locale, state, slug, title, summary, body_markdown, metadata)
  values (published.content_item_id, published.locale, 'draft', published.slug, published.title, published.summary, published.body_markdown, published.metadata) returning id into draft_variant_id;
  insert into public.content_tags (content_variant_id, tag_id) select draft_variant_id, tag_id from public.content_tags where content_variant_id = published_variant_id;
  perform public.copy_media_assets_to_draft(published_variant_id, draft_variant_id);
  return draft_variant_id;
end; $$;

create or replace function public.create_project_edit_draft(project_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare published public.content_variants; draft_id uuid;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into published from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = project_variant_id and variant.state = 'published' and item.kind = 'project' and item.author_id = (select auth.uid());
  if not found then raise exception 'published project not found'; end if;
  insert into public.content_variants (content_item_id, locale, state, slug, title, summary, body_markdown, metadata)
  values (published.content_item_id, published.locale, 'draft', published.slug, published.title, published.summary, published.body_markdown, published.metadata) returning id into draft_id;
  insert into public.content_tags (content_variant_id, tag_id) select draft_id, tag_id from public.content_tags where content_variant_id = project_variant_id;
  perform public.copy_media_assets_to_draft(project_variant_id, draft_id);
  return draft_id;
end; $$;

create or replace function public.create_curated_edit_draft(curated_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare published public.content_variants; draft_id uuid;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into published from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = curated_variant_id and variant.state = 'published' and item.kind = 'curated' and item.author_id = (select auth.uid());
  if not found then raise exception 'published curated project not found'; end if;
  insert into public.content_variants (content_item_id, locale, state, slug, title, summary, body_markdown, metadata)
  values (published.content_item_id, published.locale, 'draft', published.slug, published.title, published.summary, published.body_markdown, published.metadata) returning id into draft_id;
  insert into public.content_tags (content_variant_id, tag_id) select draft_id, tag_id from public.content_tags where content_variant_id = curated_variant_id;
  perform public.copy_media_assets_to_draft(curated_variant_id, draft_id);
  return draft_id;
end; $$;

revoke all on function public.copy_media_assets_to_draft(uuid, uuid) from public;
