# Use restricted agent import instead of database access

Local agents create article drafts through a dedicated endpoint authenticated by a separately rotatable import secret. Agents cannot connect to the database or receive Supabase credentials, including the `service_role` key. The endpoint cannot publish content or expose private content.

To store validated import-package images in Supabase Storage without opening anonymous Storage writes, the trusted server-side import executor may hold the `service_role` key. It uses that key only after authenticating the import secret and validating the complete package; it exposes neither a general Supabase client nor a general database operation. The executor may only create or update drafts, create pending tags, and manage the imported media required by those drafts.
