insert into public.content_items (id, kind)
values ('3d16c50b-2fcc-45d1-a5fa-c4e5197f0d60', 'blog');

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
values (
  '1f4f7a3b-5b91-4d0e-a5d4-a01a1389a96a',
  '3d16c50b-2fcc-45d1-a5fa-c4e5197f0d60',
  'zh-CN',
  'published',
  'agent-workflows',
  '把 agent 工作流变成可验证的工程流程',
  '从任务边界、验证证据到交接，让自动化协作可被审阅和维护。',
  E'# 先定义可验证的目标\n\n每个自动化任务都需要清晰的输入、输出和验证证据。',
  '2026-07-20T09:00:00+00:00',
  '2026-07-20T09:00:00+00:00'
);

insert into public.tags (id, slug, label, state)
values ('6cd2ee0f-3ce1-42c4-91a8-f13b157d2089', 'ai-systems', 'AI 系统', 'confirmed');

insert into public.content_tags (content_variant_id, tag_id)
values ('1f4f7a3b-5b91-4d0e-a5d4-a01a1389a96a', '6cd2ee0f-3ce1-42c4-91a8-f13b157d2089');
