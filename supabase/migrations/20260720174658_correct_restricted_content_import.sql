alter table public.import_batches
  add column if not exists created_content_item boolean not null default false,
  add column if not exists created_draft boolean not null default false,
  add column if not exists created_tag_ids uuid[] not null default array[]::uuid[],
  add column if not exists previous_draft jsonb,
  add column if not exists previous_tag_ids uuid[];

create table if not exists public.import_cleanup_tasks (
  id uuid primary key default gen_random_uuid(),
  storage_paths text[] not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.import_cleanup_tasks enable row level security;
alter table public.import_cleanup_tasks force row level security;

create or replace function public.record_import_cleanup(paths text[])
returns void language plpgsql security definer set search_path = public as $$
begin
  if cardinality(paths) > 0 then
    insert into public.import_cleanup_tasks (storage_paths) values (paths);
  end if;
end;
$$;

create or replace function public.pending_import_cleanup_paths()
returns text[] language sql security definer set search_path = public as $$
  select coalesce(array_agg(path), array[]::text[])
  from public.import_cleanup_tasks task
  cross join unnest(task.storage_paths) path
  where task.completed_at is null;
$$;

create or replace function public.complete_import_cleanup(paths text[])
returns void language sql security definer set search_path = public as $$
  update public.import_cleanup_tasks
  set completed_at = now()
  where completed_at is null and storage_paths <@ paths;
$$;

create or replace function public.prepare_import_draft(import_external_id text, import_kind public.content_kind, import_locale text, import_slug text, import_title text, import_summary text, import_body_markdown text, import_metadata jsonb, import_tags jsonb, import_digest text)
returns table (content_item_id uuid, draft_variant_id uuid, import_source_id uuid, import_batch_id uuid, result text)
language plpgsql security definer set search_path = public as $$
declare
  source public.import_sources; item_id uuid; draft_id uuid; author_id uuid; batch_id uuid;
  created_item boolean := false; created_draft boolean := false; previous_draft jsonb;
  previous_tag_ids uuid[]; created_tag_ids uuid[] := array[]::uuid[];
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

  select id into draft_id from public.content_variants where content_item_id = item_id and locale = import_locale and state = 'draft' for update;
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

create or replace function public.complete_import_draft(source_id uuid, draft_id uuid, batch_id uuid, rewritten_body_markdown text, import_digest text)
returns text[] language plpgsql security definer set search_path = public as $$
declare previous_paths text[];
begin
  update public.content_variants variant set body_markdown = rewritten_body_markdown, updated_at = now() from public.import_sources source where variant.id = draft_id and variant.state = 'draft' and source.id = source_id and source.content_item_id = variant.content_item_id;
  if not found then raise exception 'draft unavailable'; end if;
  update public.import_sources set source_digest = import_digest, last_imported_at = now() where id = source_id;
  select coalesce(array_agg(storage_path), array[]::text[]) into previous_paths from public.media_assets where content_variant_id = draft_id and import_source_id = source_id and import_batch_id <> batch_id;
  perform public.record_import_cleanup(previous_paths);
  delete from public.media_assets where content_variant_id = draft_id and import_source_id = source_id and import_batch_id <> batch_id;
  delete from public.import_batches where import_source_id = source_id and id <> batch_id;
  return previous_paths;
end;
$$;

create or replace function public.rollback_import_draft(source_id uuid, draft_id uuid, batch_id uuid)
returns text[] language plpgsql security definer set search_path = public as $$
declare batch public.import_batches; uploaded_paths text[];
begin
  select * into batch from public.import_batches where id = batch_id and import_source_id = source_id and content_variant_id = draft_id for update;
  if not found then raise exception 'import batch unavailable'; end if;
  select coalesce(array_agg(storage_path), array[]::text[]) into uploaded_paths from public.media_assets where import_batch_id = batch_id;
  perform public.record_import_cleanup(uploaded_paths);
  if batch.created_draft then
    delete from public.content_variants where id = draft_id and state = 'draft';
  else
    update public.content_variants set slug = batch.previous_draft->>'slug', title = batch.previous_draft->>'title', summary = batch.previous_draft->>'summary', body_markdown = batch.previous_draft->>'body_markdown', metadata = batch.previous_draft->'metadata', updated_at = (batch.previous_draft->>'updated_at')::timestamptz where id = draft_id and state = 'draft';
    delete from public.content_tags where content_variant_id = draft_id;
    insert into public.content_tags (content_variant_id, tag_id) select draft_id, unnest(batch.previous_tag_ids);
  end if;
  if batch.created_content_item then
    delete from public.content_items where id = (select content_item_id from public.import_sources where id = source_id);
  else
    delete from public.import_batches where id = batch_id;
  end if;
  delete from public.tags tag where tag.id = any(batch.created_tag_ids) and tag.state = 'pending' and not exists (select 1 from public.content_tags where tag_id = tag.id);
  return uploaded_paths;
end;
$$;

revoke all on function public.prepare_import_draft(text, public.content_kind, text, text, text, text, text, jsonb, jsonb, text) from public;
revoke all on function public.complete_import_draft(uuid, uuid, uuid, text, text) from public;
revoke all on function public.rollback_import_draft(uuid, uuid, uuid) from public;
revoke all on function public.record_import_cleanup(text[]) from public;
revoke all on function public.pending_import_cleanup_paths() from public;
revoke all on function public.complete_import_cleanup(text[]) from public;
grant execute on function public.prepare_import_draft(text, public.content_kind, text, text, text, text, text, jsonb, jsonb, text) to service_role;
grant execute on function public.complete_import_draft(uuid, uuid, uuid, text, text) to service_role;
grant execute on function public.rollback_import_draft(uuid, uuid, uuid) to service_role;
grant execute on function public.record_import_cleanup(text[]) to service_role;
grant execute on function public.pending_import_cleanup_paths() to service_role;
grant execute on function public.complete_import_cleanup(text[]) to service_role;
