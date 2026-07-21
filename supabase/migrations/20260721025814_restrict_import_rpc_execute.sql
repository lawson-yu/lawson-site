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
) from public;
revoke execute on function public.complete_import_draft(uuid, uuid, uuid, text, text) from public;
revoke execute on function public.rollback_import_draft(uuid, uuid, uuid) from public;
revoke execute on function public.pending_import_cleanup_paths() from public;
revoke execute on function public.complete_import_cleanup(text[]) from public;

grant execute on function public.prepare_import_draft(
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
) to service_role;
grant execute on function public.complete_import_draft(uuid, uuid, uuid, text, text) to service_role;
grant execute on function public.rollback_import_draft(uuid, uuid, uuid) to service_role;
grant execute on function public.pending_import_cleanup_paths() to service_role;
grant execute on function public.complete_import_cleanup(text[]) to service_role;
