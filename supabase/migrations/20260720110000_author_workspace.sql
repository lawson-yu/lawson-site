create table public.author_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  github_provider_id text not null unique,
  is_author boolean not null default true,
  created_at timestamptz not null default now(),
  check (is_author)
);

alter table public.content_variants
  drop constraint content_variants_locale_slug_key;

create unique index content_variants_published_slug_index
  on public.content_variants (locale, slug)
  where state = 'published';

create unique index author_profiles_single_author_index
  on public.author_profiles (is_author)
  where is_author;

alter table public.author_profiles enable row level security;
alter table public.author_profiles force row level security;
alter table public.content_items force row level security;
alter table public.content_variants force row level security;
alter table public.tags force row level security;
alter table public.content_tags force row level security;

create function public.is_author()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.author_profiles
    where user_id = (select auth.uid())
      and is_author
  );
$$;

revoke all on function public.is_author() from public;
grant execute on function public.is_author() to authenticated;

create policy "author reads own profile"
  on public.author_profiles for select to authenticated
  using (user_id = (select auth.uid()));

grant select on public.author_profiles to authenticated;

create policy "author reads own content items"
  on public.content_items for select to authenticated
  using (public.is_author() and author_id = (select auth.uid()));

create policy "author creates own content items"
  on public.content_items for insert to authenticated
  with check (public.is_author() and author_id = (select auth.uid()) and kind = 'blog');

create policy "author removes own content items"
  on public.content_items for delete to authenticated
  using (public.is_author() and author_id = (select auth.uid()));

create policy "author reads own variants"
  on public.content_variants for select to authenticated
  using (
    public.is_author()
    and exists (
      select 1 from public.content_items item
      where item.id = content_variants.content_item_id
        and item.author_id = (select auth.uid())
    )
  );

create policy "author creates draft variants"
  on public.content_variants for insert to authenticated
  with check (
    public.is_author()
    and state = 'draft'
    and published_at is null
    and exists (
      select 1 from public.content_items item
      where item.id = content_variants.content_item_id
        and item.author_id = (select auth.uid())
        and item.kind = 'blog'
    )
  );

create policy "author updates draft variants"
  on public.content_variants for update to authenticated
  using (
    public.is_author()
    and state = 'draft'
    and exists (
      select 1 from public.content_items item
      where item.id = content_variants.content_item_id
        and item.author_id = (select auth.uid())
    )
  )
  with check (
    state = 'draft'
    and published_at is null
  );

create policy "author reads tags"
  on public.tags for select to authenticated
  using (public.is_author());

create policy "author reads own content tags"
  on public.content_tags for select to authenticated
  using (
    public.is_author()
    and exists (
      select 1
      from public.content_variants variant
      join public.content_items item on item.id = variant.content_item_id
      where variant.id = content_tags.content_variant_id
        and item.author_id = (select auth.uid())
    )
  );

create policy "author sets draft tags"
  on public.content_tags for insert to authenticated
  with check (
    public.is_author()
    and exists (
      select 1
      from public.content_variants variant
      join public.content_items item on item.id = variant.content_item_id
      where variant.id = content_tags.content_variant_id
        and variant.state = 'draft'
        and item.author_id = (select auth.uid())
    )
  );

create policy "author clears draft tags"
  on public.content_tags for delete to authenticated
  using (
    public.is_author()
    and exists (
      select 1
      from public.content_variants variant
      join public.content_items item on item.id = variant.content_item_id
      where variant.id = content_tags.content_variant_id
        and variant.state = 'draft'
        and item.author_id = (select auth.uid())
    )
  );

create function public.create_blog_draft(
  draft_slug text,
  draft_title text,
  draft_summary text,
  draft_body_markdown text,
  draft_locale text,
  draft_tag_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  item_id uuid;
  variant_id uuid;
begin
  if not public.is_author() then
    raise exception 'not authorized';
  end if;

  if (select count(*) from public.tags where id = any(draft_tag_ids)) <> cardinality(draft_tag_ids) then
    raise exception 'unknown tag';
  end if;

  insert into public.content_items (kind, author_id)
  values ('blog', (select auth.uid()))
  returning id into item_id;

  insert into public.content_variants (
    content_item_id, locale, state, slug, title, summary, body_markdown
  ) values (
    item_id, draft_locale, 'draft', draft_slug, draft_title, draft_summary, draft_body_markdown
  ) returning id into variant_id;

  insert into public.content_tags (content_variant_id, tag_id)
  select variant_id, id from public.tags where id = any(draft_tag_ids);

  return variant_id;
end;
$$;

create function public.update_blog_draft(
  draft_variant_id uuid,
  draft_slug text,
  draft_title text,
  draft_summary text,
  draft_body_markdown text,
  draft_tag_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_author() then
    raise exception 'not authorized';
  end if;

  if (select count(*) from public.tags where id = any(draft_tag_ids)) <> cardinality(draft_tag_ids) then
    raise exception 'unknown tag';
  end if;

  update public.content_variants variant
  set slug = draft_slug,
      title = draft_title,
      summary = draft_summary,
      body_markdown = draft_body_markdown,
      updated_at = now()
  from public.content_items item
  where variant.id = draft_variant_id
    and variant.content_item_id = item.id
    and variant.state = 'draft'
    and item.kind = 'blog'
    and item.author_id = (select auth.uid());

  if not found then
    raise exception 'draft not found';
  end if;

  delete from public.content_tags where content_variant_id = draft_variant_id;
  insert into public.content_tags (content_variant_id, tag_id)
  select draft_variant_id, id from public.tags where id = any(draft_tag_ids);

  return draft_variant_id;
end;
$$;

create function public.create_blog_edit_draft(published_variant_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  published public.content_variants;
  draft_variant_id uuid;
begin
  if not public.is_author() then
    raise exception 'not authorized';
  end if;

  select variant.* into published
  from public.content_variants variant
  join public.content_items item on item.id = variant.content_item_id
  where variant.id = published_variant_id
    and variant.state = 'published'
    and item.kind = 'blog'
    and item.author_id = (select auth.uid());

  if not found then
    raise exception 'published blog not found';
  end if;

  insert into public.content_variants (
    content_item_id, locale, state, slug, title, summary, body_markdown, metadata
  ) values (
    published.content_item_id, published.locale, 'draft', published.slug, published.title,
    published.summary, published.body_markdown, published.metadata
  ) returning id into draft_variant_id;

  insert into public.content_tags (content_variant_id, tag_id)
  select draft_variant_id, tag_id
  from public.content_tags
  where content_variant_id = published_variant_id;

  return draft_variant_id;
end;
$$;

create function public.publish_blog_draft(draft_variant_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.content_variants;
begin
  if not public.is_author() then
    raise exception 'not authorized';
  end if;

  select variant.* into target
  from public.content_variants variant
  join public.content_items item on item.id = variant.content_item_id
  where variant.id = draft_variant_id
    and variant.state = 'draft'
    and item.kind = 'blog'
    and item.author_id = (select auth.uid());

  if not found then
    raise exception 'draft not found';
  end if;

  delete from public.content_variants
  where content_item_id = target.content_item_id
    and locale = target.locale
    and state = 'published';

  update public.content_variants
  set state = 'published', published_at = now(), updated_at = now()
  where id = target.id;

  return target.id;
end;
$$;

create function public.unpublish_blog(published_variant_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.content_variants;
begin
  if not public.is_author() then
    raise exception 'not authorized';
  end if;

  select variant.* into target
  from public.content_variants variant
  join public.content_items item on item.id = variant.content_item_id
  where variant.id = published_variant_id
    and variant.state = 'published'
    and item.kind = 'blog'
    and item.author_id = (select auth.uid());

  if not found then
    raise exception 'published blog not found';
  end if;

  if exists (
    select 1
    from public.content_variants
    where content_item_id = target.content_item_id
      and locale = target.locale
      and state = 'draft'
  ) then
    raise exception 'edit draft exists';
  end if;

  update public.content_variants
  set state = 'draft', published_at = null, updated_at = now()
  where id = target.id;

  return target.id;
end;
$$;

create function public.confirm_tag(tag_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_author() then
    raise exception 'not authorized';
  end if;

  update public.tags
  set state = 'confirmed'
  where id = tag_id
    and state = 'pending';

  if not found then
    raise exception 'pending tag not found';
  end if;

  return tag_id;
end;
$$;

revoke all on function public.publish_blog_draft(uuid) from public;
revoke all on function public.unpublish_blog(uuid) from public;
revoke all on function public.confirm_tag(uuid) from public;
revoke all on function public.create_blog_draft(text, text, text, text, text, uuid[]) from public;
revoke all on function public.update_blog_draft(uuid, text, text, text, text, uuid[]) from public;
revoke all on function public.create_blog_edit_draft(uuid) from public;
grant execute on function public.publish_blog_draft(uuid) to authenticated;
grant execute on function public.unpublish_blog(uuid) to authenticated;
grant execute on function public.confirm_tag(uuid) to authenticated;
grant execute on function public.create_blog_draft(text, text, text, text, text, uuid[]) to authenticated;
grant execute on function public.update_blog_draft(uuid, text, text, text, text, uuid[]) to authenticated;
grant execute on function public.create_blog_edit_draft(uuid) to authenticated;
