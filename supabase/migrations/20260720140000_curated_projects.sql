drop policy "author creates own content items" on public.content_items;
create policy "author creates own content items"
  on public.content_items for insert to authenticated
  with check (public.is_author() and author_id = (select auth.uid()) and kind in ('blog', 'project', 'curated'));

create function public.create_curated_draft(draft_slug text, draft_title text, draft_summary text, draft_body_markdown text, draft_locale text, draft_tag_ids uuid[], draft_metadata jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare item_id uuid; variant_id uuid;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  if draft_locale <> 'zh-CN' then raise exception 'unsupported locale'; end if;
  if (select count(*) from public.tags where id = any(draft_tag_ids)) <> cardinality(draft_tag_ids) then raise exception 'unknown tag'; end if;
  insert into public.content_items (kind, author_id) values ('curated', (select auth.uid())) returning id into item_id;
  insert into public.content_variants (content_item_id, locale, state, slug, title, summary, body_markdown, metadata)
  values (item_id, draft_locale, 'draft', draft_slug, draft_title, draft_summary, draft_body_markdown, draft_metadata) returning id into variant_id;
  insert into public.content_tags (content_variant_id, tag_id) select variant_id, id from public.tags where id = any(draft_tag_ids);
  return variant_id;
end;
$$;

create function public.update_curated_draft(draft_variant_id uuid, draft_slug text, draft_title text, draft_summary text, draft_body_markdown text, draft_tag_ids uuid[], draft_metadata jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  if (select count(*) from public.tags where id = any(draft_tag_ids)) <> cardinality(draft_tag_ids) then raise exception 'unknown tag'; end if;
  update public.content_variants variant set slug = draft_slug, title = draft_title, summary = draft_summary, body_markdown = draft_body_markdown, metadata = draft_metadata, updated_at = now()
  from public.content_items item where variant.id = draft_variant_id and variant.content_item_id = item.id and variant.state = 'draft' and item.kind = 'curated' and item.author_id = (select auth.uid());
  if not found then raise exception 'draft not found'; end if;
  delete from public.content_tags where content_variant_id = draft_variant_id;
  insert into public.content_tags (content_variant_id, tag_id) select draft_variant_id, id from public.tags where id = any(draft_tag_ids);
  return draft_variant_id;
end;
$$;

create function public.create_curated_edit_draft(curated_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare published public.content_variants; draft_id uuid;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into published from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = curated_variant_id and variant.state = 'published' and item.kind = 'curated' and item.author_id = (select auth.uid());
  if not found then raise exception 'published curated project not found'; end if;
  insert into public.content_variants (content_item_id, locale, state, slug, title, summary, body_markdown, metadata)
  values (published.content_item_id, published.locale, 'draft', published.slug, published.title, published.summary, published.body_markdown, published.metadata) returning id into draft_id;
  insert into public.content_tags (content_variant_id, tag_id) select draft_id, tag_id from public.content_tags where content_variant_id = curated_variant_id;
  return draft_id;
end;
$$;

create function public.publish_curated_draft(curated_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare target public.content_variants;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into target from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = curated_variant_id and variant.state = 'draft' and item.kind = 'curated' and item.author_id = (select auth.uid());
  if not found then raise exception 'draft not found'; end if;
  delete from public.content_variants where content_item_id = target.content_item_id and locale = target.locale and state = 'published';
  update public.content_variants set state = 'published', published_at = now(), updated_at = now() where id = target.id;
  return target.id;
end;
$$;

create function public.unpublish_curated(curated_variant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare target public.content_variants;
begin
  if not public.is_author() then raise exception 'not authorized'; end if;
  select variant.* into target from public.content_variants variant join public.content_items item on item.id = variant.content_item_id
  where variant.id = curated_variant_id and variant.state = 'published' and item.kind = 'curated' and item.author_id = (select auth.uid());
  if not found then raise exception 'published curated project not found'; end if;
  if exists (select 1 from public.content_variants where content_item_id = target.content_item_id and locale = target.locale and state = 'draft') then raise exception 'edit draft exists'; end if;
  update public.content_variants set state = 'draft', published_at = null, updated_at = now() where id = target.id;
  return target.id;
end;
$$;

revoke all on function public.create_curated_draft(text, text, text, text, text, uuid[], jsonb) from public;
revoke all on function public.update_curated_draft(uuid, text, text, text, text, uuid[], jsonb) from public;
revoke all on function public.create_curated_edit_draft(uuid) from public;
revoke all on function public.publish_curated_draft(uuid) from public;
revoke all on function public.unpublish_curated(uuid) from public;
grant execute on function public.create_curated_draft(text, text, text, text, text, uuid[], jsonb) to authenticated;
grant execute on function public.update_curated_draft(uuid, text, text, text, text, uuid[], jsonb) to authenticated;
grant execute on function public.create_curated_edit_draft(uuid) to authenticated;
grant execute on function public.publish_curated_draft(uuid) to authenticated;
grant execute on function public.unpublish_curated(uuid) to authenticated;

insert into public.content_items (id, kind, author_id)
values (
  'a47a3b18-d8ac-4531-bfbd-ea542b79c62e',
  'curated',
  (select user_id from public.author_profiles where is_author)
);

insert into public.content_variants (id, content_item_id, locale, state, slug, title, summary, body_markdown, metadata, published_at)
values ('ab1b1087-c3ae-4b6c-9d08-935d4ddada8a', 'a47a3b18-d8ac-4531-bfbd-ea542b79c62e', 'zh-CN', 'published', 'langchain', 'LangChain', '用于构建由大语言模型驱动应用的模块化开发框架。', E'# 为什么收录 LangChain\n\n它适合把模型、工具与检索流程拆成可组合的工程单元。', '{"sourceRepositoryUrl":"https://github.com/langchain-ai/langchain","problem":"为大语言模型应用提供可组合的编排与工具调用能力。","useCases":"构建检索增强生成、Agent 与多步骤自动化工作流。","commentary":"先用最小链路验证价值，再按需要引入更多抽象。","collectedAt":"2026-07-20","week":"2026-W30"}'::jsonb, '2026-07-20T12:00:00+00:00');

insert into public.content_tags (content_variant_id, tag_id)
values ('ab1b1087-c3ae-4b6c-9d08-935d4ddada8a', '6cd2ee0f-3ce1-42c4-91a8-f13b157d2089');
