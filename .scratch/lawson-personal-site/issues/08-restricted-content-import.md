# 08 — 受限 Markdown 内容导入

**What to build:** 本地 agent 可使用可轮换导入密钥，将 Markdown 与相对图片安全导入为博客、个人项目或精选项目草稿，而不会获得数据库或 Supabase 管理凭据。

Blocked by: 02 — 唯一作者内容工作区与博客管理; 03 — 个人项目的管理与公开展示; 04 — 精选项目资料库的管理与公开展示; 05 — 受管媒体的安全上传与展示.

Status: resolved

- [x] 有效导入包会按 `externalId` 幂等创建或更新草稿，且对已发布内容的更新永不直接改变公开版本。
- [x] 导入仅接受受限 Markdown、三种内容类型及同包相对图片；无效密钥、原始 HTML、路径穿越、远程或未引用图片与超额文件被拒绝。
- [x] 导入可创建待确认标签并受限写入受管媒体；agent 不获得 `service_role`、数据库连接、私有内容或通用数据操作能力。

## 评论

- 2026-07-21：修复 `prepare_import_draft` 的返回字段歧义，迁移 `20260721021602_fix_import_draft_column_ambiguity.sql` 已应用。
- 2026-07-21：导入 RPC 已撤销 `anon` 与 `authenticated` 执行权限，仅保留 `service_role`；迁移 `20260721025814_restrict_import_rpc_execute.sql`、`20260721025948_revoke_import_rpc_public_roles.sql` 已应用并核验。
- 2026-07-21：`pnpm exec playwright test e2e/import.spec.ts --reporter=line` 4/4 通过；全套 `pnpm test:e2e` 20/20 通过；`pnpm verify`、`pnpm build`、`git diff --check` 通过。
