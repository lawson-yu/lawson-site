create table public.import_sources (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null unique references public.content_items(id) on delete cascade,
  external_id text not null unique,
  source_digest text,
  last_imported_at timestamptz,
  created_at timestamptz not null default now(),
  check (source_digest is null or source_digest ~ '^[0-9a-f]{64}$')
);

alter table public.import_sources enable row level security;
alter table public.import_sources force row level security;

alter table public.media_assets
  add column import_source_id uuid references public.import_sources(id) on delete cascade,
  add column import_batch_id uuid,
  add column source_path text;

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  import_source_id uuid not null references public.import_sources(id) on delete cascade,
  content_variant_id uuid not null references public.content_variants(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.import_batches enable row level security;
alter table public.import_batches force row level security;

alter table public.media_assets
  add constraint media_assets_import_batch_id_fkey
  foreign key (import_batch_id) references public.import_batches(id) on delete cascade;

create unique index media_assets_import_batch_path_index
  on public.media_assets (content_variant_id, import_batch_id, source_path)
  where import_batch_id is not null;

create function public.prepare_import_draft(
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
language plpgsql
security definer
set search_path = public
as $$
declare
  source public.import_sources;
  item_id uuid;
  draft_id uuid;
  author_id uuid;
  batch_id uuid;
begin
  if import_locale <> 'zh-CN' then
    raise exception 'unsupported locale';
  end if;

  select * into source
  from public.import_sources
  where external_id = import_external_id
  for update;

  if found then
    item_id := source.content_item_id;
    if not exists (
      select 1 from public.content_items item
      where item.id = item_id and item.kind = import_kind
    ) then
      raise exception 'external id kind mismatch';
    end if;

    if source.source_digest = import_digest and source.last_imported_at is not null then
      select id into draft_id
      from public.content_variants
      where content_item_id = item_id and locale = import_locale and state = 'draft';
      return query select item_id, draft_id, source.id, null::uuid, 'unchanged'::text;
      return;
    end if;
  else
    select user_id into author_id
    from public.author_profiles
    where is_author
    limit 1;
    if author_id is null then
      raise exception 'author profile unavailable';
    end if;

    insert into public.content_items (kind, author_id, external_id)
    values (import_kind, author_id, import_external_id)
    returning id into item_id;

    insert into public.import_sources (content_item_id, external_id)
    values (item_id, import_external_id)
    returning * into source;
  end if;

  select id into draft_id
  from public.content_variants
  where content_item_id = item_id and locale = import_locale and state = 'draft'
  for update;

  if draft_id is null then
    insert into public.content_variants (
      content_item_id, locale, state, slug, title, summary, body_markdown, metadata
    ) values (
      item_id, import_locale, 'draft', import_slug, import_title, import_summary,
      import_body_markdown, import_metadata
    )
    returning id into draft_id;
  else
    update public.content_variants
    set slug = import_slug,
        title = import_title,
        summary = import_summary,
        body_markdown = import_body_markdown,
        metadata = import_metadata,
        updated_at = now()
    where id = draft_id;
  end if;

  insert into public.tags (slug, label, state)
  select tag->>'slug', tag->>'label', 'pending'
  from jsonb_array_elements(import_tags) tag
  on conflict (slug) do nothing;

  delete from public.content_tags where content_variant_id = draft_id;
  insert into public.content_tags (content_variant_id, tag_id)
  select draft_id, tags.id
  from public.tags
  join jsonb_array_elements(import_tags) tag on tag->>'slug' = tags.slug;

  insert into public.import_batches (import_source_id, content_variant_id)
  values (source.id, draft_id)
  returning id into batch_id;

  return query select item_id, draft_id, source.id, batch_id,
    case when source.last_imported_at is null then 'created' else 'updated' end;
end;
$$;

create function public.complete_import_draft(
  source_id uuid,
  draft_id uuid,
  batch_id uuid,
  rewritten_body_markdown text,
  import_digest text
)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare previous_paths text[];
begin
  update public.content_variants variant
  set body_markdown = rewritten_body_markdown, updated_at = now()
  from public.import_sources source
  where variant.id = draft_id
    and variant.state = 'draft'
    and source.id = source_id
    and source.content_item_id = variant.content_item_id;
  if not found then
    raise exception 'draft unavailable';
  end if;

  update public.import_sources
  set source_digest = import_digest, last_imported_at = now()
  where id = source_id;

  select coalesce(array_agg(storage_path), array[]::text[]) into previous_paths
  from public.media_assets
  where content_variant_id = draft_id
    and import_source_id = source_id
    and import_batch_id <> batch_id;
  delete from public.media_assets
  where content_variant_id = draft_id
    and import_source_id = source_id
    and import_batch_id <> batch_id;
  delete from public.import_batches
  where import_source_id = source_id and id <> batch_id;

  return previous_paths;
end;
$$;

revoke all on table public.import_sources from anon, authenticated;
revoke all on function public.prepare_import_draft(text, public.content_kind, text, text, text, text, text, jsonb, jsonb, text) from public;
revoke all on function public.complete_import_draft(uuid, uuid, uuid, text, text) from public;
grant execute on function public.prepare_import_draft(text, public.content_kind, text, text, text, text, text, jsonb, jsonb, text) to service_role;
grant execute on function public.complete_import_draft(uuid, uuid, uuid, text, text) to service_role;
