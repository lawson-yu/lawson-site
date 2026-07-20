# Lawson Site Goal handoff

## 继续目标

完成 `issues/02-author-workspace-and-blog-management.md`，通过验收、code review、提交并标记 `resolved`；再按依赖继续 03–08。

当前 Goal 仍为 `blocked`：不能在没有真实 GitHub OAuth 作者身份及托管 Supabase 授权配置的情况下完成 Ticket 02 的作者写入 / RLS e2e。用户已要求“继续”，并已打开本地登录页；下一步优先确认其完成登录。

## 当前状态

- 工作目录：`/Users/lawson/Project/MyProjest/lawson-site`
- 任务图谱：`issues/`；02 是下一张可执行 ticket，03–08 仍依赖 02。
- Ticket 02 实现、迁移、作者路由与 UI 已提交为 `1a777b1` 并推送 `origin/main`。
- 已移除 `next/font/google` Geist，改 `app/globals.css` 系统字体栈；生产构建不再请求 Google Fonts。
- 本地栈可用：`scripts/dev-local.sh status` 显示 `lawson-site-dev` / `:3000`。若状态漂移，先按 `.agents/skills/dev-local/SKILL.md` 检查。

## 已验证

- `fnm exec --using v24.15.0 pnpm verify`：通过。
- `fnm exec --using v24.15.0 pnpm build`：通过。
- `fnm exec --using v24.15.0 pnpm test:e2e`：3/3 通过（匿名写入拒绝、匿名工作区拦截、公开阅读）。
- `fnm exec --using v24.15.0 pnpm test:rls`：通过（现有匿名公开读取 RLS 检查）。
- `git diff --check`：通过。

这些只覆盖匿名 / 公开路径；不要误作完整 Ticket 02 验收。

## 当前人工交接点

- Chrome 中保留了一张本地 `http://localhost:3000/auth/login?error=unauthorized` handoff tab。
- 请用户在该页点击“使用 GitHub 登录”并完成 OAuth；不要索要、读取或输出密钥。
- 回调若仍为 `unauthorized`，需要用户在托管 Supabase 完成技术设计指定的外部配置：`AUTHOR_GITHUB_ID`，以及该 OAuth 用户对应的唯一 `author_profiles` 行。原 Goal 不允许 agent 改外部服务。
- 用户确认 `/author` 可访问后，运行作者完整流程：创建草稿、编辑、预览、发布、创建编辑草稿 / 再发布、撤回、确认 pending tag；同时验证非作者写入拒绝与公开可见性。完成后补足稳定 e2e / RLS 证据，再 review、commit、更新 ticket 状态。

## 重要边界

- 先读根 `AGENTS.md`、`spec.md`、`technical-design.md`、02 ticket；`issues/` 是执行图谱。
- 仅改当前 ticket；不部署、不推送、不改生产或外部服务；不得读取、输出或提交 `.env*` / 密钥。
- 真实权限证明不得用 `service_role` 伪造。参见 `technical-design.md` 的 OAuth、RLS 与测试策略章节。
- 只在 Ticket 02 验收完成后继续修改 ticket 状态。

## 建议 skills

- `$implement`：按 ticket 收尾、验证、review、commit。
- `$supabase:supabase`：OAuth、RLS、迁移和安全核查。
- `$dev-local`：本地 Next.js 栈状态异常时。
- `$code-review`：Ticket 02 验收完成后的 standards + spec review。
- `$tdd`：补作者流程的稳定测试时。
- `$caveman`：若用户继续要求极简中文沟通。
