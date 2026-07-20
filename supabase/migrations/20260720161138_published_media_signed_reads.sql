create policy "published media signs and downloads without listing" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'content-media' and
    storage.allow_any_operation(array['object.get_authenticated_info', 'object.get_authenticated']) and
    exists (
      select 1 from public.media_assets asset
      join public.content_variants variant on variant.id = asset.content_variant_id
      where asset.storage_path = storage.objects.name and variant.state = 'published'
    )
  );
