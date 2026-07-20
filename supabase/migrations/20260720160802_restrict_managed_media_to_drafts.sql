drop policy "author manages own media assets" on public.media_assets;
create policy "author manages own draft media assets" on public.media_assets
  for all to authenticated
  using (public.is_author() and exists (
    select 1 from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
    where variant.id = media_assets.content_variant_id and variant.state = 'draft' and item.author_id = (select auth.uid())
  ))
  with check (public.is_author() and exists (
    select 1 from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
    where variant.id = media_assets.content_variant_id and variant.state = 'draft' and item.author_id = (select auth.uid())
  ));

drop policy "author uploads content media" on storage.objects;
create policy "author uploads draft content media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'content-media' and public.is_author() and
    exists (
      select 1 from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
      where variant.id::text = (storage.foldername(name))[2] and variant.state = 'draft' and item.author_id = (select auth.uid())
    )
  );
