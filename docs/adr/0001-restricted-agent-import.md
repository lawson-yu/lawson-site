# Use restricted agent import instead of database access

Local agents create article drafts through a dedicated endpoint authenticated by a separately rotatable import secret. The endpoint cannot publish content or expose database credentials, avoiding direct use of the Supabase `service_role` key while preserving automatic ingestion.
