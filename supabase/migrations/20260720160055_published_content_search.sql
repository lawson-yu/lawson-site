create extension if not exists pgroonga with schema extensions;

alter table public.content_variants
  add column search_document tsvector not null default ''::tsvector,
  add column search_text text not null default '';

create or replace function public.refresh_content_variant_search(search_variant_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  tag_text text;
begin
  select coalesce(string_agg(tag.label, ' ' order by tag.slug), '')
    into tag_text
  from public.content_tags content_tag
  join public.tags tag on tag.id = content_tag.tag_id
  where content_tag.content_variant_id = search_variant_id
    and tag.state = 'confirmed';

  update public.content_variants variant
  set
    search_text = concat_ws(' ', variant.title, variant.summary, variant.body_markdown, tag_text),
    search_document =
      setweight(to_tsvector('simple', coalesce(variant.title, '')), 'A') ||
      setweight(to_tsvector('simple', coalesce(variant.summary, '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(variant.body_markdown, '')), 'C') ||
      setweight(to_tsvector('simple', tag_text), 'B')
  where variant.id = search_variant_id;
end;
$$;

create or replace function public.refresh_current_variant_search()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform public.refresh_content_variant_search(new.id);
  return new;
end;
$$;

create or replace function public.refresh_tagged_variant_search()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_content_variant_search(old.content_variant_id);
    return old;
  end if;

  perform public.refresh_content_variant_search(new.content_variant_id);
  return new;
end;
$$;

create or replace function public.refresh_confirmed_tag_search()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  variant_id uuid;
begin
  if old.state = new.state then
    return new;
  end if;

  for variant_id in
    select content_tag.content_variant_id
    from public.content_tags content_tag
    where content_tag.tag_id = new.id
  loop
    perform public.refresh_content_variant_search(variant_id);
  end loop;

  return new;
end;
$$;

create trigger content_variants_refresh_search
after insert or update of title, summary, body_markdown on public.content_variants
for each row execute function public.refresh_current_variant_search();

create trigger content_tags_refresh_search
after insert or update or delete on public.content_tags
for each row execute function public.refresh_tagged_variant_search();

create trigger tags_refresh_search
after update of state on public.tags
for each row execute function public.refresh_confirmed_tag_search();

select public.refresh_content_variant_search(id)
from public.content_variants;

create index content_variants_search_document_index
  on public.content_variants using gin (search_document);

create index content_variants_search_text_pgroonga_index
  on public.content_variants using pgroonga (search_text);

create or replace function public.search_published_content(
  search_locale text,
  search_query text,
  search_kind public.content_kind default null,
  search_cursor integer default 0
)
returns table (
  id uuid,
  kind public.content_kind,
  locale text,
  slug text,
  title text,
  summary text,
  published_at timestamptz,
  tags jsonb
)
language sql
stable
security invoker
set search_path = extensions, pg_catalog
as $$
  with matches as (
    select
      variant.id,
      item.kind,
      variant.locale,
      variant.slug,
      variant.title,
      variant.summary,
      variant.published_at,
      coalesce(
        jsonb_agg(
          jsonb_build_object('label', tag.label, 'slug', tag.slug)
          order by tag.slug
        ) filter (where tag.state = 'confirmed'),
        '[]'::jsonb
      ) as tags
    from public.content_variants variant
    join public.content_items item on item.id = variant.content_item_id
    left join public.content_tags content_tag on content_tag.content_variant_id = variant.id
    left join public.tags tag on tag.id = content_tag.tag_id
    where variant.state = 'published'
      and variant.locale = search_locale
      and (search_kind is null or item.kind = search_kind)
      and nullif(btrim(search_query), '') is not null
      and variant.search_text &@~ btrim(search_query)
    group by variant.id, item.kind
  )
  select *
  from matches
  order by published_at desc, id desc
  limit 20
  offset greatest(search_cursor, 0) * 20;
$$;

revoke all on function public.refresh_content_variant_search(uuid) from public;
revoke all on function public.search_published_content(text, text, public.content_kind, integer) from public;
grant execute on function public.search_published_content(text, text, public.content_kind, integer)
  to anon, authenticated;
