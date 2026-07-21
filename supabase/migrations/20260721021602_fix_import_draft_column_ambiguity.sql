create or replace function public.prepare_import_draft(
  import_external_id text,
  import_kind public.content_kind,
  import_locale text,
  import_slug text,
  import_title text,
  import_summary text,
  import_body_markdown text,
  import_metadata jsonb,
  import_tags jsonb,
  import_digest text
)
returns table (
  content_item_id uuid,
  draft_variant_id uuid,
  import_source_id uuid,
  import_batch_id uuid,
  result text
)
language plpgsql security definer set search_path = public as $$
declare
  source public.import_sources;
  item_id uuid;
  draft_id uuid;
  author_id uuid;
  batch_id uuid;
  created_item boolean := false;
  created_draft boolean := false;
  previous_draft jsonb;
  previous_tag_ids uuid[];
  created_tag_ids uuid[] := array[]::uuid[];
begin
  if import_locale <> 'zh-CN' then raise exception 'unsupported locale'; end if;
  select * into source from public.import_sources where external_id = import_external_id for update;
  if found then
    item_id := source.content_item_id;
    if not exists (select 1 from public.content_items item where item.id = item_id and item.kind = import_kind) then raise exception 'external id kind mismatch'; end if;
  else
    select user_id into author_id from public.author_profiles where is_author limit 1;
    if author_id is null then raise exception 'author profile unavailable'; end if;
    insert into public.content_items (kind, author_id, external_id) values (import_kind, author_id, import_external_id) returning id into item_id;
    created_item := true;
    insert into public.import_sources (content_item_id, external_id) values (item_id, import_external_id) returning * into source;
  end if;

  select variant.id into draft_id
  from public.content_variants variant
  where variant.content_item_id = item_id
    and variant.locale = import_locale
    and variant.state = 'draft'
  for update;
  if source.source_digest = import_digest and source.last_imported_at is not null and draft_id is not null then
    return query select item_id, draft_id, source.id, null::uuid, 'unchanged'::text; return;
  end if;
  if draft_id is not null then
    select jsonb_build_object('slug', variant.slug, 'title', variant.title, 'summary', variant.summary, 'body_markdown', variant.body_markdown, 'metadata', variant.metadata, 'updated_at', variant.updated_at) into previous_draft from public.content_variants variant where variant.id = draft_id;
    select coalesce(array_agg(tag_id), array[]::uuid[]) into previous_tag_ids from public.content_tags where content_variant_id = draft_id;
  else
    insert into public.content_variants (content_item_id, locale, state, slug, title, summary, body_markdown, metadata) values (item_id, import_locale, 'draft', import_slug, import_title, import_summary, import_body_markdown, import_metadata) returning id into draft_id;
    created_draft := true;
  end if;
  if not created_draft then
    update public.content_variants set slug = import_slug, title = import_title, summary = import_summary, body_markdown = import_body_markdown, metadata = import_metadata, updated_at = now() where id = draft_id;
  end if;
  with inserted as (
    insert into public.tags (slug, label, state) select tag->>'slug', tag->>'label', 'pending' from jsonb_array_elements(import_tags) tag on conflict (slug) do nothing returning id
  ) select coalesce(array_agg(id), array[]::uuid[]) into created_tag_ids from inserted;
  delete from public.content_tags where content_variant_id = draft_id;
  insert into public.content_tags (content_variant_id, tag_id) select draft_id, tags.id from public.tags join jsonb_array_elements(import_tags) tag on tag->>'slug' = tags.slug;
  insert into public.import_batches (import_source_id, content_variant_id, created_content_item, created_draft, created_tag_ids, previous_draft, previous_tag_ids) values (source.id, draft_id, created_item, created_draft, created_tag_ids, previous_draft, previous_tag_ids) returning id into batch_id;
  return query select item_id, draft_id, source.id, batch_id, case when source.last_imported_at is null then 'created' else 'updated' end;
end;
$$;
