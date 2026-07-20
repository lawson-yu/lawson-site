# 05 — 受管媒体的安全上传与展示

**What to build:** 作者草稿与已发布内容可以安全使用受管图片；私有 Storage 不向匿名上传开放，公开页面只渲染已发布内容的媒体。

Blocked by: 02 — 唯一作者内容工作区与博客管理.

Status: resolved

- [x] 作者可在草稿中使用受管媒体，已发布内容中的 Markdown 图片可正确渲染，并具备可读 alt 文本。
- [x] 非作者不能读取草稿媒体，匿名调用方不能直接上传或枚举私有对象。
- [x] 不再被内容引用的媒体可安全清理，Storage 权限与媒体行为有自动化验证。

## 评论

- 已交付私有媒体 bucket、draft-only 上传、草稿/已发布的受限 signed URL、Markdown AST 清理和编辑发布时的媒体迁移。
- 已将全部 Ticket 05 migrations 应用到 linked Supabase 测试项目。
- 验证：作者和非作者媒体 e2e、`pnpm test:rls`、`pnpm verify`、`pnpm build`、`git diff --check`；最终 Standards 与 Spec review 均无阻断项。
