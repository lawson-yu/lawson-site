insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-media',
  'content-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  content_variant_id uuid not null references public.content_variants(id) on delete cascade,
  storage_path text not null unique,
  alt text not null check (char_length(alt) between 1 and 300),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  byte_size integer not null check (byte_size > 0 and byte_size <= 5242880),
  created_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;
alter table public.media_assets force row level security;

create policy "author manages own media assets" on public.media_assets
  for all to authenticated
  using (public.is_author() and exists (
    select 1 from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
    where variant.id = media_assets.content_variant_id and item.author_id = (select auth.uid())
  ))
  with check (public.is_author() and exists (
    select 1 from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
    where variant.id = media_assets.content_variant_id and item.author_id = (select auth.uid())
  ));

create policy "public reads published media records" on public.media_assets
  for select to anon, authenticated
  using (exists (select 1 from public.content_variants variant where variant.id = media_assets.content_variant_id and variant.state = 'published'));

create policy "author uploads content media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'content-media' and public.is_author() and (storage.foldername(name))[1] = 'author');
create policy "author reads content media" on storage.objects
  for select to authenticated
  using (bucket_id = 'content-media' and public.is_author());
create policy "author deletes content media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'content-media' and public.is_author());
