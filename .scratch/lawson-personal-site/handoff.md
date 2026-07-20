# Lawson Site Goal handoff

## 继续目标

完整交付 `.scratch/lawson-personal-site/issues/` 中未完成的 07、08；每张 ticket 验收通过后标记 `resolved`，最后执行跨 ticket review 与完整回归。

## 当前状态

- 工作目录：`/Users/lawson/Projects/MyProject/lawson-site`。
- 01–06 已 `resolved`；当前下一张为 07（首页与全站公开体验），08 仍在其前置项完成后执行。
- 当前任务约定为串行执行，避免共享工作目录冲突：07 → 08。
- Ticket 05 migration `20260720153341_managed_media.sql` 已由 `pnpm exec supabase db push --linked` 应用到 linked 测试 Supabase 项目；不要重复应用或改生产项目。
- 本地站点使用 `scripts/dev-local.sh`，默认 `http://localhost:3000`；托管 Supabase 不使用本地 Docker。

## Ticket 05 交付与验证

- 私有 `content-media` Storage bucket、draft-only 媒体记录/RLS、三类作者编辑器上传与删除控件、受限公开/草稿 signed URL。
- 编辑草稿会复制媒体引用并重写 Markdown URL；再次发布后图片仍可访问，且共享对象只会在最后一个引用删除后清理。
- 通过：作者/非作者媒体 e2e、`pnpm test:rls`、`pnpm verify`、`pnpm build`、`git diff --check`，以及最终 Standards + Spec `$code-review`。

## Ticket 06 交付与验证

- 搜索仅索引并返回 published 内容及 confirmed 标签，支持 blog/project/curated 筛选、PGroonga 中文匹配和相关性稳定分页。
- 已应用 `20260720160055_published_content_search.sql` 与 `20260720163922_correct_published_search.sql` 到 linked 测试项目；后者修正初版的草稿索引与排序问题。
- 通过：`pnpm test:rls`、`pnpm exec playwright test e2e/search.spec.ts --reporter=line`、`pnpm verify`、`pnpm build`、`git diff --check`，以及最终 Standards + Spec `$code-review`。

## 重要边界

- 先读根 `AGENTS.md`、`spec.md`、`technical-design.md`、当前 ticket；优先使用 codebase-memory-mcp 导航代码。
- 使用 `pnpm` 与 Node `>=24 <25`。本机未安装 `fnm` 的 v24.15.0；当前 Node 24.14.1 仍符合项目 engine。若严格需要该精确版本，先安装后再跑最终门禁。
- 不读取、输出或提交 `.env*`、密钥或 `evidence/`；不部署、不推送、不改生产或未明确授权的外部服务。
- Supabase client 仅由 `lib/supabase/` 创建；不要在页面直接导入 `@supabase/ssr`。导入调用方绝不能取得 service role、数据库连接、私有内容或通用数据操作能力。
- 每张 ticket 仅在独立验收（含相关 e2e/RLS、`pnpm verify`、`pnpm build`、`git diff --check`）通过后更新 Status；最后执行完整 `pnpm test:e2e`。
