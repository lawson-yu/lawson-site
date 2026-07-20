drop policy "author creates own content items" on public.content_items;
create policy "author creates own content items"
  on public.content_items for insert to authenticated
  with check (
    public.is_author()
    and author_id = (select auth.uid())
    and kind in ('blog', 'project')
  );

create function public.create_project_draft(
  draft_slug text, draft_title text, draft_summary text, draft_body_markdown text,
  draft_locale text, draft_tag_ids uuid[], draft_metadata jsonb
)
returns uuid language plpgsql security definer set search_path = public as $$
declare item_id uuid; variant_id uuid;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  if (select count(*) from public.tags where id = any(draft_tag_ids)) <> cardinality(draft_tag_ids) then raise exception 'unknown tag'; end if;
  insert into public.content_items (kind, author_id) values ('project', (select auth.uid())) returning id into item_id;
  insert into public.content_variants (content_item_id, locale, state, slug, title, summary, body_markdown, metadata)
  values (item_id, draft_locale, 'draft', draft_slug, draft_title, draft_summary, draft_body_markdown, draft_metadata) returning id into variant_id;
  insert into public.content_tags (content_variant_id, tag_id) select variant_id, id from public.tags where id = any(draft_tag_ids);
  return variant_id;
end;
$$;

create function public.update_project_draft(
  draft_variant_id uuid, draft_slug text, draft_title text, draft_summary text,
  draft_body_markdown text, draft_tag_ids uuid[], draft_metadata jsonb
)
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  if (select count(*) from public.tags where id = any(draft_tag_ids)) <> cardinality(draft_tag_ids) then raise exception 'unknown tag'; end if;
  update public.content_variants variant set slug = draft_slug, title = draft_title, summary = draft_summary,
    body_markdown = draft_body_markdown, metadata = draft_metadata, updated_at = now()
  from public.content_items item where variant.id = draft_variant_id and variant.content_item_id = item.id
    and variant.state = 'draft' and item.kind = 'project' and item.author_id = (select auth.uid());
  if not found then raise exception 'draft not found'; end if;
  delete from public.content_tags where content_variant_id = draft_variant_id;
  insert into public.content_tags (content_variant_id, tag_id) select draft_variant_id, id from public.tags where id = any(draft_tag_ids);
  return draft_variant_id;
end;
$$;

create function public.create_project_edit_draft(project_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare published public.content_variants; draft_id uuid;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into published from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = project_variant_id and variant.state = 'published' and item.kind = 'project' and item.author_id = (select auth.uid());
  if not found then raise exception 'published project not found'; end if;
  insert into public.content_variants (content_item_id, locale, state, slug, title, summary, body_markdown, metadata)
  values (published.content_item_id, published.locale, 'draft', published.slug, published.title, published.summary, published.body_markdown, published.metadata) returning id into draft_id;
  insert into public.content_tags (content_variant_id, tag_id) select draft_id, tag_id from public.content_tags where content_variant_id = project_variant_id;
  return draft_id;
end;
$$;

create function public.publish_project_draft(project_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare target public.content_variants;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into target from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = project_variant_id and variant.state = 'draft' and item.kind = 'project' and item.author_id = (select auth.uid());
  if not found then raise exception 'draft not found'; end if;
  delete from public.content_variants where content_item_id = target.content_item_id and locale = target.locale and state = 'published';
  update public.content_variants set state = 'published', published_at = now(), updated_at = now() where id = target.id;
  return target.id;
end;
$$;

create function public.unpublish_project(project_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare target public.content_variants;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into target from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = project_variant_id and variant.state = 'published' and item.kind = 'project' and item.author_id = (select auth.uid());
  if not found then raise exception 'published project not found'; end if;
  if exists (select 1 from public.content_variants where content_item_id = target.content_item_id and locale = target.locale and state = 'draft') then raise exception 'edit draft exists'; end if;
  update public.content_variants set state = 'draft', published_at = null, updated_at = now() where id = target.id;
  return target.id;
end;
$$;

revoke all on function public.create_project_draft(text, text, text, text, text, uuid[], jsonb) from public;
revoke all on function public.update_project_draft(uuid, text, text, text, text, uuid[], jsonb) from public;
revoke all on function public.create_project_edit_draft(uuid) from public;
revoke all on function public.publish_project_draft(uuid) from public;
revoke all on function public.unpublish_project(uuid) from public;
grant execute on function public.create_project_draft(text, text, text, text, text, uuid[], jsonb) to authenticated;
grant execute on function public.update_project_draft(uuid, text, text, text, text, uuid[], jsonb) to authenticated;
grant execute on function public.create_project_edit_draft(uuid) to authenticated;
grant execute on function public.publish_project_draft(uuid) to authenticated;
grant execute on function public.unpublish_project(uuid) to authenticated;

insert into public.content_items (id, kind)
values ('a58b0fb8-0dda-4d19-a787-a6a55eb014c6', 'project');

insert into public.content_variants (id, content_item_id, locale, state, slug, title, summary, body_markdown, metadata, published_at)
values (
  'cc5ee249-7041-4df0-a9b1-1d10f0eaf9e7', 'a58b0fb8-0dda-4d19-a787-a6a55eb014c6', 'zh-CN', 'published',
  'lawson-site', 'LAWSON Site', '一个以真实项目、工程实践与 AI 学习为核心的可持续个人技术站。',
  E'# 从内容边界开始\n\n这个项目把公开阅读、作者工作区和后续自动导入拆成可独立验证的纵向切片。',
  '{"problem":"个人技术站缺少可持续发布真实项目与工程经验的内容边界。","outcomes":"建立了公开内容、唯一作者工作区和可验证的权限模型。","techStack":["Next.js","TypeScript","Supabase","Playwright"],"repositoryUrl":"https://github.com/lawson/lawson-site","demoUrl":null,"coverImageUrl":null,"featured":true}'::jsonb,
  '2026-07-20T10:00:00+00:00'
);
