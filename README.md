# Lawson Site

一个基于 Next.js App Router 的个人站点骨架。当前仓库包含公开首页占位、全局样式、Supabase SSR 客户端和请求层 session 刷新逻辑，可继续演进为个人技术媒体站或带后台的内容管理站点。

## 当前状态

- 首页已接入 App Router，当前为极简占位界面。
- 已配置 Tailwind CSS 4 和全局基础样式。
- 已提供 Supabase 浏览器端 client、服务端 client 和请求层 session 刷新。
- 已配置 ESLint、Prettier、Husky、lint-staged 和 Conventional Commit 校验。
- 登录页、后台页、内容模型和数据表结构尚未实现。

## 技术栈

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase SSR
- ESLint 9
- Prettier
- pnpm

## 运行要求

- Node.js `>=24 <25`
- pnpm
- Supabase 项目（使用认证或数据能力时需要）

仓库包含 `.node-version`，本地建议使用 Node.js 24。使用 `pnpm-lock.yaml` 安装依赖，避免不同包管理器产生锁文件差异。

## 快速开始

启用 pnpm（如果本机尚未启用 Corepack）：

```bash
corepack enable
```

安装依赖：

```bash
pnpm install
```

创建本地环境变量文件 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

如果暂时不使用 Supabase，可以不创建 `.env.local`；当前首页不依赖这些变量，请求层也会在变量缺失时跳过 session 检查。

启动开发服务器：

```bash
pnpm dev
```

打开 `http://localhost:3000`。

## 常用命令

| 命令                | 说明                     |
| ------------------- | ------------------------ |
| `pnpm dev`          | 启动本地开发服务器       |
| `pnpm build`        | 生成生产构建             |
| `pnpm start`        | 运行生产构建             |
| `pnpm lint`         | 运行 ESLint              |
| `pnpm typecheck`    | 运行 TypeScript 类型检查 |
| `pnpm format`       | 使用 Prettier 格式化文件 |
| `pnpm format:check` | 检查格式但不写入文件     |

生产构建和本地预览：

```bash
pnpm build
pnpm start
```

## 项目结构

```text
app/
  globals.css       # 全局样式
  layout.tsx        # 根布局和 metadata
  page.tsx          # 首页壳层
lib/
  supabase/
    client.ts       # 浏览器端 Supabase client
    server.ts       # 服务端 Supabase client
    proxy.ts        # 请求层 session 刷新和访问保护
  utils.ts          # 通用工具
proxy.ts            # Next.js proxy 入口
eslint.config.mjs   # ESLint 配置
prettier.config.mjs # Prettier 配置
next.config.ts      # Next.js 配置
```

## Supabase 说明

当前 Supabase 配置读取以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`proxy.ts` 会调用 `lib/supabase/proxy.ts` 中的 `updateSession`，用于刷新 Supabase session。环境变量缺失时会跳过代理检查，方便项目初始化阶段运行。

当前访问保护逻辑会允许首页、`/login` 和 `/auth` 路径访问；其他路径在未登录时会重定向到 `/auth/login`。对应登录页面和后台页面仍需在后续功能中实现。

## 开发约定

- 新页面优先放在 `app/` 下，遵循 Next.js App Router 约定。
- 浏览器端 Supabase 调用使用 `lib/supabase/client.ts`。
- Server Component、Route Handler 或 Server Action 中的 Supabase 调用使用 `lib/supabase/server.ts`。
- 请求层 session 刷新逻辑集中在 `lib/supabase/proxy.ts`，`proxy.ts` 只保留 Next.js 入口和 matcher。
- 样式优先使用 Tailwind class；需要组合 class 时使用 `lib/utils.ts` 里的 `cn`。

## 部署说明

项目适合部署到 Vercel 或其他支持 Next.js 的平台。

部署时需要注意：

- 使用 Node.js 24。
- 配置 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 后，非公开路径会启用未登录重定向。
- 当前 `app/layout.tsx` 会优先使用 `VERCEL_URL` 生成 `metadataBase`，本地环境回退到 `http://localhost:3000`。

## 提交规范

提交信息使用 Conventional Commit，例如：

```text
feat: add blog list page
fix: handle missing supabase env vars
chore: update dependencies
```

提交时 Husky 会运行 `lint-staged`，对暂存的 JS/TS 文件执行 ESLint 修复和 Prettier 格式化，对 JSON、CSS、Markdown、YAML 文件执行 Prettier 格式化。

## 验证

改动后建议至少运行：

```bash
pnpm lint
pnpm typecheck
pnpm build
```

只改 Markdown 时可以运行：

```bash
pnpm format:check
```
