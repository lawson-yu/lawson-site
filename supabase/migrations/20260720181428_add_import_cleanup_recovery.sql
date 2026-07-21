create table public.import_cleanup_tasks (
  id uuid primary key default gen_random_uuid(),
  storage_paths text[] not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.import_cleanup_tasks enable row level security;
alter table public.import_cleanup_tasks force row level security;

create function public.record_import_cleanup(paths text[])
returns void language plpgsql security definer set search_path = public as $$
begin
  if cardinality(paths) > 0 then insert into public.import_cleanup_tasks (storage_paths) values (paths); end if;
end;
$$;

create function public.pending_import_cleanup_paths()
returns text[] language sql security definer set search_path = public as $$
  select coalesce(array_agg(path), array[]::text[])
  from public.import_cleanup_tasks task cross join unnest(task.storage_paths) path
  where task.completed_at is null;
$$;

create function public.complete_import_cleanup(paths text[])
returns void language sql security definer set search_path = public as $$
  update public.import_cleanup_tasks set completed_at = now()
  where completed_at is null and storage_paths <@ paths;
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
  if batch.created_draft then delete from public.content_variants where id = draft_id and state = 'draft';
  else
    update public.content_variants set slug = batch.previous_draft->>'slug', title = batch.previous_draft->>'title', summary = batch.previous_draft->>'summary', body_markdown = batch.previous_draft->>'body_markdown', metadata = batch.previous_draft->'metadata', updated_at = (batch.previous_draft->>'updated_at')::timestamptz where id = draft_id and state = 'draft';
    delete from public.content_tags where content_variant_id = draft_id;
    insert into public.content_tags (content_variant_id, tag_id) select draft_id, unnest(batch.previous_tag_ids);
  end if;
  if batch.created_content_item then delete from public.content_items where id = (select content_item_id from public.import_sources where id = source_id);
  else delete from public.import_batches where id = batch_id; end if;
  delete from public.tags tag where tag.id = any(batch.created_tag_ids) and tag.state = 'pending' and not exists (select 1 from public.content_tags where tag_id = tag.id);
  return uploaded_paths;
end;
$$;

revoke all on table public.import_cleanup_tasks from anon, authenticated;
revoke all on function public.record_import_cleanup(text[]) from public;
revoke all on function public.pending_import_cleanup_paths() from public;
revoke all on function public.complete_import_cleanup(text[]) from public;
revoke all on function public.complete_import_draft(uuid, uuid, uuid, text, text) from public;
revoke all on function public.rollback_import_draft(uuid, uuid, uuid) from public;
grant execute on function public.record_import_cleanup(text[]) to service_role;
grant execute on function public.pending_import_cleanup_paths() to service_role;
grant execute on function public.complete_import_cleanup(text[]) to service_role;
grant execute on function public.complete_import_draft(uuid, uuid, uuid, text, text) to service_role;
grant execute on function public.rollback_import_draft(uuid, uuid, uuid) to service_role;
