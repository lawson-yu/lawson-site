create or replace function public.refresh_content_variant_search(search_variant_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  tag_text text;
  variant_state public.content_state;
begin
  select state into variant_state
  from public.content_variants
  where id = search_variant_id;

  if variant_state is distinct from 'published' then
    update public.content_variants
    set search_text = '', search_document = ''::tsvector
    where id = search_variant_id;
    return;
  end if;

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

drop trigger content_variants_refresh_search on public.content_variants;
create trigger content_variants_refresh_search
after insert or update of state, title, summary, body_markdown on public.content_variants
for each row execute function public.refresh_current_variant_search();

select public.refresh_content_variant_search(id)
from public.content_variants;

drop index public.content_variants_search_document_index;
create index content_variants_search_document_index
  on public.content_variants using gin (search_document)
  where state = 'published';

drop index public.content_variants_search_text_pgroonga_index;
create index content_variants_search_text_pgroonga_index
  on public.content_variants using pgroonga (search_text)
  where state = 'published';

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
  with searched as (
    select
      variant.id,
      variant.content_item_id,
      variant.locale,
      variant.slug,
      variant.title,
      variant.summary,
      variant.published_at,
      pgroonga_score(variant.tableoid, variant.ctid) as rank
    from public.content_variants variant
    where variant.state = 'published'
      and variant.locale = search_locale
      and nullif(btrim(search_query), '') is not null
      and variant.search_text &@~ btrim(search_query)
  ), matches as (
    select
      searched.id,
      item.kind,
      searched.locale,
      searched.slug,
      searched.title,
      searched.summary,
      searched.published_at,
      searched.rank,
      coalesce(tags.tags, '[]'::jsonb) as tags
    from searched
    join public.content_items item on item.id = searched.content_item_id
    left join lateral (
      select jsonb_agg(
        jsonb_build_object('label', tag.label, 'slug', tag.slug)
        order by tag.slug
      ) as tags
      from public.content_tags content_tag
      join public.tags tag on tag.id = content_tag.tag_id
      where content_tag.content_variant_id = searched.id
        and tag.state = 'confirmed'
    ) tags on true
    where search_kind is null or item.kind = search_kind
  )
  select id, kind, locale, slug, title, summary, published_at, tags
  from matches
  order by rank desc, published_at desc, id desc
  limit 20
  offset greatest(search_cursor, 0) * 20;
$$;
