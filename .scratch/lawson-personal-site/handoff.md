# Lawson Site Goal handoff

## 接手目标

完成 `.scratch/lawson-personal-site/issues/08-restricted-content-import.md`，仅在独立验收通过后将其标为 `resolved`；随后执行全量跨-ticket review 与回归，完成整个站点目标。

## 当前状态

- 工作目录：`/Users/lawson/Projects/MyProject/lawson-site`。
- 01–07 均为 `resolved`。07 已在 `b678e31 feat(site): add public site experience` 提交。
- 08 仍为 `ready-for-agent`，实现已提交为 `bb3cd56 feat(import): add restricted content import`；不要提前改 ticket 状态。
- 当前工作区除本交接文档外应保持干净。接手后先以 `git status --short` 和 `git show --stat bb3cd56` 审阅 08，不要改写或重置既有提交。
- 本目标约定：每张 ticket 使用 `$implement`，验收完成后使用 `$code-review`；不推送、不部署、不改生产。

## 已交付记录

- Ticket 05：`471536d feat(media): add managed content images`。相关迁移已应用到 linked 测试 Supabase：`20260720153341_managed_media.sql`、`20260720160802_restrict_managed_media_to_drafts.sql`、`20260720161138_published_media_signed_reads.sql`、`20260720161728_media_deletion_recovery.sql`、`20260720162358_preserve_media_on_edit_drafts.sql`。
- Ticket 06：`670d851 feat(search): add published content search`。相关迁移已应用：`20260720160055_published_content_search.sql`、`20260720163922_correct_published_search.sql`。
- Ticket 07：`b678e31 feat(site): add public site experience`。已完成首页、关于/联系、公开导航、301 locale 入口、RSS、sitemap、canonical/noindex；e2e、`pnpm verify`、`pnpm build`、`git diff --check` 及最终 review 已通过。

## Ticket 08 已实现但未验收的范围

- 实现在 `bb3cd56 feat(import): add restricted content import`；提交只保留可审阅的工作，不代表 ticket 已验收。
- 路由与实现：`app/api/import/route.ts`、`lib/import/contract.ts`、`lib/import/import-content.ts`、`lib/import/rate-limit.ts`、`lib/supabase/import-executor.ts`。
- 契约 e2e：`e2e/import.spec.ts`。
- 限制导入为三种内容类型、front matter、相对图片、MIME/数量/大小和 Markdown 图片引用；拒绝原始 HTML、远程 URL、路径穿越和未引用图片。
- 使用可轮换的导入密钥常量时间比较；请求 Content-Length 预检与每进程、按密钥摘要限流。该限流不是跨实例的安全边界，数据库/RPC 仍必须承载授权边界。
- 以 `externalId` 和摘要幂等更新草稿；若既有内容已发布，则创建或更新可审核草稿，绝不直接改公开版本。
- 导入执行器限定为服务端模块；调用方不接触 service role、数据库连接、私有内容或通用数据操作。
- 失败补偿会恢复旧草稿/标签/import source/batch；Storage 清理任务在数据库持久化并可重试。

## 08 迁移和历史注意事项

- 以下迁移已应用到 linked 测试 Supabase：`20260720173138_restricted_content_import.sql`、`20260720174658_correct_restricted_content_import.sql`、`20260720181428_add_import_cleanup_recovery.sql`。
- `20260720173138_restricted_content_import.sql` 曾被误改；已从已应用的 Git blob 精确恢复，当前本地版本必须保持与远端 migration history 一致。任何新修正只能新增 migration，绝不能重写已应用 migration。
- 迁移使用受限 RPC 和清理队列表。继续变更前先审阅三份 migration 的最终 diff 与已链接项目的 migration 状态。

## 已验证与当前阻塞

- 已通过：`pnpm verify`、`pnpm build`、`git diff --check`；导入接口的缺失/错误密钥契约测试通过。
- 有效导入的三个 e2e 用例当前均返回 HTTP 500，因而 08 **未通过验收**。这是实际运行时失败，不可用跳过测试替代。
- 最强线索是运行 Next.js 服务的环境未提供导入执行器所需的 `SUPABASE_SERVICE_ROLE_KEY`；该执行器需要该服务端变量调用私有 RPC 和 Storage。不要读取、输出、提交或要求他人发送 `.env*` 或密钥。
- 路由的导入密钥哈希环境变量名为 `IMPORT_SECRET_HASH`（可选轮换变量 `IMPORT_SECRET_PREVIOUS_HASH`）；测试通过 `IMPORT_TEST_SECRET` 提供与哈希匹配的测试密钥。使用本地安全配置后重启开发服务，再运行：

  `IMPORT_TEST_SECRET=<本地测试密钥> pnpm exec playwright test e2e/import.spec.ts --reporter=line`

  仅在服务端同时具备有效的 `SUPABASE_SERVICE_ROLE_KEY` 和匹配的导入密钥哈希时，该命令才应验证有效导入流程。不要将真实值写入命令历史、文档或仓库。

## 推荐续做顺序

1. 阅读根 `AGENTS.md`、`spec.md`、`technical-design.md`、ADR `docs/adr/0001-restricted-agent-import.md`、08 ticket 与当前 diff；优先用 codebase-memory-mcp 导航。
2. 在不读取或修改 `.env*` 的前提下，确认运行服务的安全环境已由维护者配置 `SUPABASE_SERVICE_ROLE_KEY`、导入密钥哈希和测试密钥；重启本地服务。
3. 先让 `e2e/import.spec.ts` 的有效导入、幂等、已发布保护和图片重写用例真实通过；如仍为 500，安全地检查服务器日志/受限 RPC 返回，不泄露任何凭据。
4. 运行相关 RLS/迁移验证，以及 `pnpm verify`、`pnpm build`、`git diff --check`；最后运行完整 `pnpm test:e2e`。
5. 对 08 做 Standards 与 Spec 两轴独立 `$code-review`；修复发现后重新跑相关验证。
6. 验收通过后，更新 08 ticket 为 `resolved`，更新本交接并以新的 docs commit 记录状态。之后再执行最终跨-ticket review、完整回归和干净工作区检查。

## 重要边界

- 使用 `pnpm` 与 Node `>=24 <25`；本机 Node 24.14.1 满足项目 engine。
- Supabase client 仅由 `lib/supabase/` 创建；页面中不得直接导入 `@supabase/ssr`。
- 不读取、输出或提交 `.env*`、密钥、`evidence/`；不部署、不推送、不改生产或其他未授权外部服务。
- 本地通过 `scripts/dev-local.sh` 管理开发栈，默认 `http://localhost:3000`；托管 Supabase 不使用本地 Docker。

## Suggested skills

- `$implement`：按目标约定继续并完成 08。
- `$supabase:supabase`：检查 migration/RPC/Storage 与 linked 测试项目，不改写已应用迁移。
- `$verify`：在有效导入恢复后收集验收证据。
- `$code-review`：08 完成后与最终跨-ticket 审阅。
- `$diagnosing-bugs`：若配置齐全后有效导入仍返回 500，按证据链定位。
