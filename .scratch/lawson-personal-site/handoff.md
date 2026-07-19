# LAWSON Site Handoff

## Next session goal

完成技术设计，供用户审阅；技术设计确认后才重新拆 tickets。不要开始实现公开页面、认证、数据库或导入功能。

## Current state

- 产品与领域澄清已完成。
- 产品规格：`spec.md`。
- 术语、难逆转决策、视觉规范分别在：
  - `../../CONTEXT.md`
  - `../../docs/adr/0001-restricted-agent-import.md`
  - `../../docs/adr/0002-locale-aware-content-from-launch.md`
  - `../../DESIGN.md`
- 用户已配置 Supabase 项目、GitHub OAuth provider、Auth 本地 Site URL 与 callback redirect URL，并已创建本地 `.env.local`。未检查或记录任何密钥。
- 12 个 tickets 曾被提前生成，现已删除；`issues/` 目录不存在。这是有意回退，不要恢复或实现旧 tickets。
- 尚未改动首页或业务代码。当前规划文档显示为 staged；不要擅自取消暂存、提交或覆盖用户的 git 状态。

## Correct workflow recovery

1. 阅读 AGENTS.md、规格、术语、ADR 与 DESIGN.md。
2. 产出并审阅 `technical-design.md`。
3. 技术设计必须说明模块、interface、seam、数据模型、RLS、Storage、OAuth/导入/公开读取请求流、前端 fixture 到真实数据的替换方式、测试策略与实现顺序。
4. 请用户确认技术设计。
5. 更新规格中的实现决策与测试决策，使其链接或总结技术设计。
6. 执行 `/to-tickets`，重新生成基于技术设计的 tickets。
7. 仅在 tickets 重新确认后，执行 `/implement`；UI-first 但保持真实功能纵向切片。

## Suggested skills

- `codebase-design`：当前技术设计核心，设计深模块、interface 与 seam。
- `domain-modeling`：技术设计若引入或改变规范术语时更新 CONTEXT.md。
- `supabase`：涉及 Auth、RLS、Storage、迁移时先查当前官方文档与 changelog。
- `prototype`：仅当 UI 或状态问题无法靠技术设计决定时使用；原型不进入生产实现。
- `/to-tickets`：技术设计经用户确认后使用。
- `/implement`：只在每张 ticket `ready-for-agent` 后使用。

## Important boundaries

- 使用 pnpm、Node 24、Next.js App Router、Supabase client 边界和 Tailwind 约定。
- 不提交 `.env*`、`evidence/` 或密钥。
- 自动导入禁止直连数据库或使用 Supabase service role；遵守 ADR 0001。
- 首发中文、locale-aware 数据模型、单作者 GitHub OAuth、草稿/已发布两态、无自动发布；完整内容决策以 spec 和 CONTEXT.md 为准。
