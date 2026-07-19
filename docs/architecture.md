# 架构

## 运行时

这是一个单体 Next.js App Router 应用。`pnpm dev` 在 `http://localhost:3000` 启动；当前没有本地数据库、缓存或后台服务。

## 请求与认证边界

`proxy.ts` 是 Next.js 的唯一 proxy 入口，并委托给 `lib/supabase/proxy.ts` 刷新 Supabase session 和保护非公开路径。若没有配置两个 Supabase 环境变量，session 检查会跳过，方便公开首页本地开发。

Supabase client 的职责按运行环境划分：

- `lib/supabase/client.ts`：Client Component 的浏览器 client。
- `lib/supabase/server.ts`：Server Component、Route Handler 与 Server Action 的服务端 client。
- `lib/supabase/proxy.ts`：请求期 session 刷新与重定向。

只允许这些模块直接引入 `@supabase/ssr`；ESLint 会阻止在页面和入口文件中绕过该边界。

## 配置

认证或数据能力需要在 `.env.local` 中配置：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

不要提交环境变量文件。当前 Supabase 是托管依赖，不需要 Docker 或本地 Supabase 服务。
