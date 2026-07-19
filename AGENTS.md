# Lawson Site

Next.js App Router 个人站点骨架。使用 pnpm、Node 24 和托管 Supabase；本地开发服务默认在 `http://localhost:3000`。

## 黄金规则

- 使用 `pnpm`，并保持 Node.js 在 `>=24 <25`。
- 新路由和页面放在 `app/`，遵循 App Router 约定。
- Supabase 客户端只能通过 `lib/supabase/` 创建；不要在页面中直接引入 `@supabase/ssr`。
- `proxy.ts` 只作为 Next.js 入口；session 刷新与访问控制在 `lib/supabase/proxy.ts`。
- 样式优先 Tailwind；需要拼接 class 时使用 `lib/utils.ts` 的 `cn`。
- 不提交 `.env*` 或 `evidence/` 中的本地数据和验证产物。

## 仓库地图

| 位置              | 内容                                 |
| ----------------- | ------------------------------------ |
| `app/`            | 页面、根布局和全局样式               |
| `lib/supabase/`   | 浏览器、服务端及请求层 Supabase 边界 |
| `proxy.ts`        | Next.js proxy 入口与 matcher         |
| `scripts/`        | 本地启动和静态验证命令               |
| `e2e/`            | 已启动应用的系统级浏览器测试         |
| `docs/`           | 架构与测试系统记录                   |
| `.agents/skills/` | 仓库可复用的 agent 工作流            |

## 常用工作流

- 启动：`scripts/dev-local.sh up`；检查状态：`scripts/dev-local.sh status`。
- 静态检查：`pnpm verify`；完整 CI 检查见 `docs/testing.md`。
- e2e：先启动本地栈，再运行 `pnpm test:e2e`。
- 需要证明功能行为时，按 `.agents/skills/verify/SKILL.md` 的 `/verify` 流程执行。
- 代码导航优先使用已索引的 `codebase-memory-mcp` 图谱；需要时重新索引仓库。

## 延伸阅读

| 问题                          | 文档                   |
| ----------------------------- | ---------------------- |
| 架构、Supabase 边界、环境变量 | `docs/architecture.md` |
| 本地启动、检查与 e2e          | `docs/testing.md`      |
| 全部文档索引                  | `docs/index.md`        |

## Agent skills

### Issue tracker

任务与规格使用仓库内 `.scratch/` 的 Markdown 文件管理。见 `docs/agents/issue-tracker.md`。

### Triage labels

使用默认的五个 triage 标签。见 `docs/agents/triage-labels.md`。

### Domain docs

采用单上下文文档布局。见 `docs/agents/domain.md`。
