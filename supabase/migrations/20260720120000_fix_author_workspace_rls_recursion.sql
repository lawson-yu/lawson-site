create function public.is_author_content_item(candidate_content_item_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_author()
    and exists (
      select 1
      from public.content_items item
      where item.id = candidate_content_item_id
        and item.author_id = (select auth.uid())
    );
$$;

create function public.is_author_content_variant(candidate_variant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_author()
    and exists (
      select 1
      from public.content_variants variant
      join public.content_items item on item.id = variant.content_item_id
      where variant.id = candidate_variant_id
        and item.author_id = (select auth.uid())
    );
$$;

revoke all on function public.is_author_content_item(uuid) from public;
revoke all on function public.is_author_content_variant(uuid) from public;
grant execute on function public.is_author_content_item(uuid) to authenticated;
grant execute on function public.is_author_content_variant(uuid) to authenticated;

drop policy "author reads own variants" on public.content_variants;
create policy "author reads own variants"
  on public.content_variants for select to authenticated
  using (public.is_author_content_item(content_item_id));

drop policy "author creates draft variants" on public.content_variants;
create policy "author creates draft variants"
  on public.content_variants for insert to authenticated
  with check (
    public.is_author_content_item(content_item_id)
    and state = 'draft'
    and published_at is null
  );

drop policy "author updates draft variants" on public.content_variants;
create policy "author updates draft variants"
  on public.content_variants for update to authenticated
  using (
    public.is_author_content_item(content_item_id)
    and state = 'draft'
  )
  with check (
    state = 'draft'
    and published_at is null
  );

drop policy "author reads own content tags" on public.content_tags;
create policy "author reads own content tags"
  on public.content_tags for select to authenticated
  using (public.is_author_content_variant(content_variant_id));

drop policy "author sets draft tags" on public.content_tags;
create policy "author sets draft tags"
  on public.content_tags for insert to authenticated
  with check (
    public.is_author_content_variant(content_variant_id)
    and exists (
      select 1
      from public.content_variants variant
      where variant.id = content_tags.content_variant_id
        and variant.state = 'draft'
    )
  );

drop policy "author clears draft tags" on public.content_tags;
create policy "author clears draft tags"
  on public.content_tags for delete to authenticated
  using (
    public.is_author_content_variant(content_variant_id)
    and exists (
      select 1
      from public.content_variants variant
      where variant.id = content_tags.content_variant_id
        and variant.state = 'draft'
    )
  );
