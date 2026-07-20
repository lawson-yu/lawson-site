create type public.content_kind as enum ('blog', 'project', 'curated');
create type public.content_state as enum ('draft', 'published');
create type public.tag_state as enum ('pending', 'confirmed');

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind public.content_kind not null,
  author_id uuid references auth.users (id),
  external_id text unique,
  created_at timestamptz not null default now()
);

create table public.content_variants (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  locale text not null,
  state public.content_state not null default 'draft',
  slug text not null,
  title text not null,
  summary text not null,
  body_markdown text not null,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((state = 'published') = (published_at is not null)),
  unique (content_item_id, locale, state),
  unique (locale, slug)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  state public.tag_state not null default 'pending'
);

create table public.content_tags (
  content_variant_id uuid not null references public.content_variants (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (content_variant_id, tag_id)
);

create index content_variants_published_blog_index
  on public.content_variants (locale, published_at desc)
  where state = 'published';

alter table public.content_items enable row level security;
alter table public.content_variants enable row level security;
alter table public.tags enable row level security;
alter table public.content_tags enable row level security;

grant select on public.content_items, public.content_variants, public.tags, public.content_tags
  to anon, authenticated;

create policy "published content items are readable"
  on public.content_items for select to anon, authenticated
  using (
    exists (
      select 1
      from public.content_variants variant
      where variant.content_item_id = content_items.id
        and variant.state = 'published'
    )
  );

create policy "published variants are readable"
  on public.content_variants for select to anon, authenticated
  using (state = 'published');

create policy "confirmed tags are readable"
  on public.tags for select to anon, authenticated
  using (state = 'confirmed');

create policy "published variants expose confirmed tags"
  on public.content_tags for select to anon, authenticated
  using (
    exists (
      select 1
      from public.content_variants variant
      where variant.id = content_tags.content_variant_id
        and variant.state = 'published'
    )
    and exists (
      select 1
      from public.tags tag
      where tag.id = content_tags.tag_id
        and tag.state = 'confirmed'
    )
  );

insert into public.content_items (id, kind)
values ('f6d4fa7e-7f36-41e3-a1d3-0d3c52aebf39', 'blog');

insert into public.content_variants (
  id,
  content_item_id,
  locale,
  state,
  slug,
  title,
  summary,
  body_markdown,
  published_at,
  updated_at
)
values
  (
    '0ca7609e-e36e-4a9c-b437-b22af76cc0dd',
    'f6d4fa7e-7f36-41e3-a1d3-0d3c52aebf39',
    'zh-CN',
    'published',
    'personal-site-foundation',
    '从零搭建可持续维护的个人技术站',
    '用内容契约、公开读取边界与小而真的页面切片，让个人站从第一篇文章开始可持续演进。',
    E'# 先定义内容契约\n\n一个可长期维护的个人站，不从堆叠页面开始，而从明确的内容模型开始。\n\n## 公开读取必须收口\n\n访客只能看到已发布内容，草稿和待确认标签不应进入公开结果。\n\n> 好的第一个切片，既能被读者感知，也能验证数据边界。\n\n```ts\nconst visibility = "published";\n```\n\n<script>window.__unsafe = true</script>',
    '2026-07-20T08:00:00+00:00',
    '2026-07-20T08:00:00+00:00'
  ),
  (
    '4563e3ef-0bb3-44e7-a4f2-6da5ef371659',
    'f6d4fa7e-7f36-41e3-a1d3-0d3c52aebf39',
    'zh-CN',
    'draft',
    'internal-draft',
    '不会出现在公开站的草稿',
    '这条数据用于验证匿名读取边界。',
    '# 草稿',
    null,
    '2026-07-20T08:00:00+00:00'
  );

insert into public.tags (id, slug, label, state)
values
  ('af6a2b35-bbfe-4b60-8e68-c609a15d6d9d', 'engineering', '工程实践', 'confirmed'),
  ('0ed12c55-42d8-43df-a4d2-0b20dcaa6c72', 'unreviewed', '待确认标签', 'pending');

insert into public.content_tags (content_variant_id, tag_id)
values
  ('0ca7609e-e36e-4a9c-b437-b22af76cc0dd', 'af6a2b35-bbfe-4b60-8e68-c609a15d6d9d'),
  ('0ca7609e-e36e-4a9c-b437-b22af76cc0dd', '0ed12c55-42d8-43df-a4d2-0b20dcaa6c72');
