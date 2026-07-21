revoke execute on function public.prepare_import_draft(
  text,
  public.content_kind,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  text
) from anon, authenticated;
revoke execute on function public.complete_import_draft(uuid, uuid, uuid, text, text) from anon, authenticated;
revoke execute on function public.rollback_import_draft(uuid, uuid, uuid) from anon, authenticated;
revoke execute on function public.pending_import_cleanup_paths() from anon, authenticated;
revoke execute on function public.complete_import_cleanup(text[]) from anon, authenticated;
