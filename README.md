# Lawson Site

一个使用 Next.js App Router 和托管 Supabase 构建的个人内容站点。站点提供多语言公开阅读体验，以及仅供作者使用的内容工作台；作者可以管理博客、精选内容、个人项目和媒体资源，并通过受限导入接口接收外部内容。

## 功能概览

- 公开内容：首页、关于页、博客、精选内容、项目、搜索、RSS 与站点地图。
- 多语言：公开页面位于 `app/[locale]/`，内容按语言展示。
- 作者工作台：管理草稿、预览、发布与下线博客、精选内容和项目。
- 媒体管理：上传、引用和受控读取媒体资源。
- 认证与权限：GitHub OAuth 登录，Supabase session 刷新，作者与非作者访问控制。
- 内容导入：受限的服务端导入接口，并具备限流与恢复逻辑。

## 技术栈

- Next.js App Router、React 19、TypeScript
- Tailwind CSS 4
- Supabase SSR 与 Supabase PostgreSQL / Storage
- Zod、React Markdown、remark-gfm
- Playwright、ESLint、Prettier、Husky、Commitlint
- pnpm、Node.js 24

## 运行要求

- Node.js `>=24 <25`（仓库通过 `.node-version` 固定主版本）
- pnpm
- Supabase 项目（使用认证、内容或媒体能力时需要）

## 快速开始

安装依赖：

```bash
corepack enable
pnpm install
```

创建 `.env.local`，填入 Supabase 项目配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

启动本地开发栈：

```bash
scripts/dev-local.sh up
```

访问 `http://localhost:3000`。查看服务状态或停止服务：

```bash
scripts/dev-local.sh status
scripts/dev-local.sh down
```

该项目使用托管 Supabase，不会启动本地数据库或 Docker 服务。

## 常用命令

| 命令                | 说明                                       |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | 直接启动 Next.js 开发服务器                |
| `pnpm verify`       | 运行 ESLint、TypeScript 与空白 diff 检查   |
| `pnpm build`        | 构建生产产物                               |
| `pnpm test:e2e`     | 对已启动的本地站点运行 Playwright 测试     |
| `pnpm test:rls`     | 验证公开内容与媒体相关的 Supabase RLS 策略 |
| `pnpm format:check` | 检查格式但不修改文件                       |
| `pnpm format`       | 使用 Prettier 格式化仓库文件               |

首次运行端到端测试时，安装 Chromium：

```bash
pnpm exec playwright install chromium
```

## 项目结构

```text
.
├── app/                                      # Next.js App Router 页面、路由处理器与全局样式
│   ├── [locale]/                             # 按语言分组的公开页面
│   │   └── (public)/                         # 不影响 URL 的公开路由组
│   │       ├── page.tsx                      # 多语言首页
│   │       ├── about/page.tsx                # 多语言关于页
│   │       ├── blog/                         # 博客列表、详情与 Markdown 渲染组件
│   │       ├── curated/                      # 精选内容列表与详情页
│   │       ├── projects/                     # 项目列表与详情页
│   │       └── search/page.tsx               # 已发布内容搜索页
│   ├── api/                                  # 仅服务端运行的 Route Handler
│   │   ├── author/                           # 作者的博客、精选内容、项目、标签与媒体管理 API
│   │   └── import/route.ts                   # 受限内容导入入口
│   ├── auth/                                 # GitHub OAuth 登录、回调与退出登录
│   ├── author/                               # 作者工作台、编辑表单、预览和生命周期操作
│   ├── media/[variantId]/[assetId]/route.ts  # 受权限控制的媒体读取路由
│   ├── rss.xml/route.ts                      # RSS XML 输出路由
│   ├── sitemap.ts                            # Next.js sitemap 生成器
│   ├── layout.tsx                            # 根布局、全局 metadata 与字体
│   ├── globals.css                           # 全站基础样式与 Tailwind 入口
│   └── page.tsx                              # 默认语言入口或跳转页
├── lib/                                      # 与页面解耦的领域逻辑和基础设施
│   ├── author/                               # 作者身份判定及各内容类型的输入校验
│   ├── content/                              # 公开目录、Markdown、媒体、项目和工作台内容查询
│   ├── import/                               # 导入契约、导入编排和限流
│   ├── supabase/                             # 浏览器端、服务端、公开访问与 proxy 的 Supabase 边界
│   ├── site-url.ts                           # 站点 URL 推导工具
│   └── utils.ts                              # 通用工具，例如 Tailwind class 合并
├── supabase/                                 # Supabase CLI 配置与数据库演进记录
│   ├── config.toml                           # 本地 CLI 项目配置
│   └── migrations/                           # 按时间顺序执行的 schema、RLS 与数据迁移
├── e2e/                                      # Playwright 真实用户路径测试
│   ├── public-experience.spec.ts             # 公开内容浏览体验
│   ├── author-*.spec.ts                      # 作者工作台与内容生命周期
│   ├── import.spec.ts                        # 受限导入流程
│   └── non-author.spec.ts                    # 已登录非作者的访问控制
├── scripts/                                  # 本地开发与可重复执行的验证脚本
│   ├── dev-local.sh                          # tmux 中启动、停止和检查本地站点
│   ├── verify.sh                             # `pnpm verify` 的静态检查编排
│   └── verify-*.mjs                          # 针对公开内容和媒体的 RLS 验证
├── docs/                                     # 架构、测试与 agent 工作流文档
│   ├── adr/                                  # 关键架构决策记录
│   ├── agents/                               # 仓库内 issue、领域与 triage 约定
│   ├── architecture.md                       # Supabase 边界、认证路径和环境变量
│   ├── testing.md                            # 本地开发、验证、e2e 与 CI 说明
│   └── index.md                              # 文档索引
├── .scratch/                                 # 本地任务、规格与实施过程材料（不作为运行时代码）
├── AGENTS.md                                 # 面向编码 agent 的项目约定
├── CONTEXT.md                                # 当前产品与实施上下文
├── DESIGN.md                                 # 视觉与交互设计约定
├── proxy.ts                                  # Next.js proxy 入口；委托 session 刷新与访问控制
├── playwright.config.ts                      # Playwright 配置与验证产物路径
├── next.config.ts                            # Next.js 配置
├── eslint.config.mjs                         # ESLint 规则
├── prettier.config.mjs                       # Prettier 与 Tailwind 排序配置
├── package.json                              # 依赖、脚本与 Node.js 版本约束
└── pnpm-lock.yaml                            # pnpm 依赖锁定文件
```

## Supabase 与权限边界

所有 Supabase client 都必须通过 `lib/supabase/` 创建：

- `client.ts`：Client Component 使用的浏览器 client。
- `server.ts`：Server Component、Route Handler 和 Server Action 使用的服务端 client。
- `proxy.ts`：请求期间刷新 session，并对受保护路径执行重定向。
- `public.ts`：公开内容读取使用的访问边界。

根目录的 `proxy.ts` 仅作为 Next.js 入口。不要在页面或路由中直接引入 `@supabase/ssr`，也不要提交 `.env*` 文件。

## 验证

常规改动后，建议执行：

```bash
pnpm verify
pnpm build
```

涉及用户可见行为时，在本地栈已启动的前提下执行：

```bash
pnpm test:e2e
```

涉及 Supabase 权限策略时，再执行：

```bash
pnpm test:rls
```

端到端测试的截图、录像、trace 和本地登录会话会写入 `evidence/` 或 `test-results/`，这些本地验证产物不应提交。

## 相关文档

- [架构说明](docs/architecture.md)
- [测试与验证](docs/testing.md)
- [文档索引](docs/index.md)
- [Agent 工作约定](AGENTS.md)
