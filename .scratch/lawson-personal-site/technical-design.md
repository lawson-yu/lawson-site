# LAWSON Site 技术设计

Status: confirmed (2026-07-20)

## 目标与非目标

本设计把公开阅读、唯一作者管理和自动导入组织为少量深模块。每个模块只向页面或路由暴露其领域动作；页面不直接查询 Supabase，也不自行解释发布、授权、标签或 Markdown 规则。

首发范围与 `spec.md` 一致：中文公开站、博客/个人项目/精选项目、唯一作者 GitHub OAuth、草稿与已发布两态、受限 Markdown 导入、图片、搜索与 SEO。它不增加读者账户、版本历史、多人协作、定时发布或语言切换器。

`CONTEXT.md` 中的术语为本设计的规范术语；尤其是“作者身份”“草稿”“已发布文章”“自动导入”“内容契约”和“外部内容标识”。

## 需确认的安全决策

### 冲突

当前规格同时要求：

1. 导入方只持有导入密钥，不能直连数据库，也不能持有 `service_role`；
2. 导入端点本身不得使用 `service_role`；
3. 导入图片必须写入 Supabase Storage；
4. Storage 不能向匿名调用方开放写入。

这四项无法同时满足。导入密钥是 Next.js 应用层凭据，并不是可令 Storage RLS 识别的 Supabase JWT；若为 `anon` 放开 Storage `INSERT`，调用者可以绕开 Next.js 端点直接写入 bucket。Supabase Storage 上传还需要对应 RLS 权限（且上传响应需要匹配的 `SELECT` 权限）。[Storage access control](https://supabase.com/docs/guides/storage/security/access-control) [Storage 403 troubleshooting](https://supabase.com/docs/guides/troubleshooting/storage-error-403-forbidden-new-row-violates-row-level-security-policy-on-upload-a94384)

### 已确认：受信任的导入执行器持有 service role

保留“agent 不持有 service role、不直连数据库”的产品安全目标，将禁令收窄为：**导入调用方不能获得或使用 service role；仅受信任的服务端导入执行器可在验证导入密钥后使用它。**

该执行器可以是受限 Next.js Route Handler；它只实现本文件定义的 `ImportContent` interface，不能公开通用 Supabase client、读取私有内容或发布。密钥只在部署环境保存，绝不返回给调用方。数据库仍启用 RLS；service role 仅用于这个不可由浏览器调用、输入已验证的原子导入流程。

替代方案是取消图片自动导入，改为作者后台上传；其余“不使用 service role”的限制才可原样保留。用户已确认采用推荐方案；这个决定需要同时更新 ADR 0001 和 `spec.md`。

## 模块与 seam

| Module             | Interface（调用方需要知道的事）                                                                  | Implementation / Adapter                                                       | Depth 与 locality                                           |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `ContentCatalog`   | `listPublished`、`getPublished`、`searchPublished`；只接收 locale、筛选与分页；找不到返回 `null` | Supabase/Postgres adapter，集中状态、标签、排序、slug 与搜索约束               | 所有公开页只学习三种读取动作，不重复 `published`/标签过滤。 |
| `ContentWorkspace` | `getDraft`、`saveDraft`、`publish`、`unpublish`；调用者只能以作者身份操作                        | Supabase/Postgres adapter；事务维护草稿/公开替换、标签和时间戳                 | 后台和导入共享内容规则，发布状态不会散落在页面。            |
| `AuthorIdentity`   | `startGitHubLogin`、`currentAuthor`、`requireAuthor`                                             | `lib/supabase/*` client adapter + GitHub provider identity 检查                | 把 session 刷新和“唯一 GitHub 用户 ID”授权收在一个 seam。   |
| `ImportContent`    | `import(multipartPackage): ImportResult`；成功只返回草稿 ID、状态和诊断，不返回私有内容          | Route Handler adapter；解析、校验、图片上传、Markdown 改写、标签暂存和幂等写入 | 导入方不需要数据库表、Storage path 或发布规则知识。         |
| `MarkdownDocument` | `parse`、`validate`、`render`；输入/输出均是已定义的内容契约                                     | front matter parser、Markdown AST sanitizer、语法高亮/复制渲染 adapter         | 同一语法与安全规则用于预览、公开详情和导入。                |
| `ContentMedia`     | `uploadImportImages`、`getRenderableUrl`、`deleteUnreferenced`                                   | private Storage adapter，按内容 variant UUID 组织对象、生成短时 signed URL     | 路由和 Markdown 不接触 bucket policy 或对象路径。           |

页面、Server Components、Route Handlers 都只能跨以上 interface；它们不直接导入 `@supabase/ssr`，继续遵守既有 `lib/supabase/` seam。一个模块只有一个 adapter 时，不为假想替换创建额外 seam；测试 adapter 仅在接口测试确有需要时引入。

### 数据访问与 HTTP 约定

- 浏览器、Client Component 和外部 agent 只通过 Next.js Route Handler（`/api/*`）读取或写入后端数据。
- Server Component、`generateMetadata`、sitemap 和 RSS 在服务端直接调用同一领域模块的 interface；它们不请求本站自己的 Route Handler。这样构建期预渲染不依赖一个正在监听的应用服务器，也不增加内部 HTTP 往返。
- Route Handler 是 HTTP transport adapter：解析请求、调用 `AuthorIdentity`、使用 Zod 校验不可信输入、调用领域模块并映射稳定 DTO 与状态码。发布、导入、标签和权限规则不能写在 Handler 中。
- 公开读取可在领域查询函数上用 React `cache` 去重同一次渲染中的页面与 metadata 读取；持作者 cookie 的后台读取和写入不跨用户缓存。
- Zod 用于 Route Handler 参数、导入 front matter 与 `metadata` 的运行时验证；已在 TypeScript 内部建立的领域值不重复解析。

该约定遵循 Next.js App Router 的官方建议：Server Component 直接从数据源或服务端模块读取，Client Component 通过 Route Handler 访问后端。参考 [Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend)、[Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data) 与 [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)。

## 目录与路由

```text
app/
  [locale]/(public)/page.tsx
  [locale]/(public)/blog/page.tsx
  [locale]/(public)/blog/[slug]/page.tsx
  [locale]/(public)/projects/page.tsx
  [locale]/(public)/projects/[slug]/page.tsx
  [locale]/(public)/curated/page.tsx
  [locale]/(public)/curated/[slug]/page.tsx
  [locale]/(public)/about/page.tsx
  [locale]/(public)/search/page.tsx
  author/...                         # 受保护后台
  auth/login/route.ts
  auth/callback/route.ts
  api/content/route.ts
  api/content/[id]/route.ts
  api/search/route.ts
  api/tags/route.ts
  api/import/route.ts
  media/[contentVariantId]/[assetId]/route.ts
lib/
  content/{catalog,workspace,types}.ts
  author/identity.ts
  import/{contract,import-content}.ts
  markdown/document.ts
  media/content-media.ts
  supabase/{client,server,proxy}.ts
supabase/migrations/
```

公开 canonical URL 为 `/{locale}/...`，首发只接受 `zh-CN`。`/`、`/blog`、`/projects`、`/curated`、`/about`、`/search` 301 到对应的 `zh-CN` URL，既满足 locale-first URL，又保留用户容易输入的入口。公开导航不显示 `/author` 或认证路由；`/search` 输出 `noindex`。

`proxy.ts` 仅做 session 刷新。保护规则只匹配 `/author/:path*`，而不是当前“除首页外均要求登录”的行为；公开内容、认证 callback、`/api/import` 和媒体 Route Handler 各自在自己的 interface 验证权限。

## 数据模型

### 关系

```text
content_items 1 ── * content_variants * ── * content_tags * ── 1 tags
                    │
                    └── * media_assets
author_profiles 1 ── * content_items
content_items 1 ── 0..1 import_sources
```

### 表与关键不变量

| 表                 | 核心字段                                                                                                                                                                   | 不变量                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `author_profiles`  | `user_id` (FK `auth.users`)、`github_provider_id`、`is_author`                                                                                                             | 只存在一个 `is_author = true`；授权比对稳定 GitHub provider ID，不使用用户名或 user metadata。                   |
| `content_items`    | `id`、`kind` (`blog`/`project`/`curated`)、`author_id`、`external_id`、`created_at`                                                                                        | `external_id` 可空，但非空时唯一；kind 在创建后不可改变。                                                        |
| `content_variants` | `id`、`content_item_id`、`locale`、`state` (`draft`/`published`)、`slug`、`title`、`summary`、`body_markdown`、`body_html`、`metadata jsonb`、`published_at`、`updated_at` | 对每个 `(content_item_id, locale, state)` 最多一行；公开查询只读 published；同 locale 的公开 slug 对 kind 唯一。 |
| `tags`             | `id`、`slug`、`label`、`state` (`pending`/`confirmed`)                                                                                                                     | `slug` 唯一；只有 confirmed 标签可在公开筛选项和公开内容标签中出现。                                             |
| `content_tags`     | `content_variant_id`、`tag_id`                                                                                                                                             | 唯一配对；写入时可关联 pending 标签，但公开 adapter 过滤它。                                                     |
| `media_assets`     | `id`、`content_variant_id`、`storage_path`、`alt`、`mime_type`、`byte_size`                                                                                                | 对象路径不是公开 URL；只能由 `ContentMedia` 签发可渲染 URL。                                                     |
| `import_sources`   | `content_item_id`、`external_id`、`source_digest`、`last_imported_at`                                                                                                      | `external_id` 唯一并映射到一个内容 identity，保证重试不重复创建。                                                |

项目字段（问题、成果、技术栈、仓库、演示、封面、置顶）与精选项目字段（来源仓库、解决问题、用途、短评、收录日期、周）保存在 `content_variants.metadata`，并由 `kind` 对应的 Zod schema 验证。首发无需为尚未查询的字段另建浅表；若将来出现跨内容类型的稳定查询条件，再提升为列和索引。

### 状态转换

`draft → published` 是唯一的发布转换；`published → draft` 是撤回。发布在一个数据库事务内进行：删除同一 `(content_item, locale)` 的旧 published variant（不保留版本历史），再将目标 draft 标为 published。已发布内容被导入时，导入器创建或更新同一内容 identity 的 draft variant，绝不触碰 published variant。这样同一 locale 同时最多有一份公开内容和一份待审核草稿。

## RLS 与 Storage

所有 `public` schema 表开启并强制 RLS：

- `anon`：只可 `SELECT` 已发布 `content_variants` 及其 confirmed tags；不能列出草稿、pending tags、`import_sources` 或 `author_profiles` 的授权字段。
- `authenticated`：没有通用写权限；通过 `is_author()`（`security definer`、只读 `author_profiles`、以 `auth.uid()` 比对）获得唯一作者的后台读写权限。绝不从可由用户修改的 `raw_user_meta_data` 读取授权事实。[Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
- 发布、撤回和导入调用受限 SQL function；函数显式设置 `search_path`，检查作者或受信任导入执行器所传的已验证身份，并只执行相应状态转换。

`content-media` 使用 private bucket，限制 MIME 为图片类型和设定大小上限。Storage 对象通过 API 创建/删除，不直接改 `storage` schema；该 schema 的元数据应视为只读。[Storage schema](https://supabase.com/docs/guides/storage/schema/design)

- 公开详情页由 `ContentMedia.getRenderableUrl` 仅在内容 variant 已发布时生成短时 signed URL。
- 作者可对自己的草稿取得 signed URL；其他登录身份不可以。
- 受信任导入执行器写入 `imports/{contentVariantId}/{assetId}`，并立即记录 `media_assets`；失败时补偿删除已上传对象。
- 后台仅可删除不再被 Markdown AST 引用的媒体；删除数据库记录与 Storage object 成对处理。

## OAuth、导入与公开读取流

### OAuth 与作者后台

```text
作者 → /auth/login → Supabase GitHub OAuth → /auth/callback
     → AuthorIdentity.requireAuthor
       → provider='github' 的 identity_data.provider_id == AUTHOR_GITHUB_ID
       → /author；否则登出并显示无权访问
```

`AUTHOR_GITHUB_ID` 是部署环境变量，不记录在仓库或客户端。首次上线时，作者先在 Supabase Dashboard 为该 GitHub OAuth user ID 建立唯一 `author_profiles` 行；callback 只接受同时匹配该环境变量与该 profile 的身份，其他 GitHub 身份不创建作者权限。这样 callback 不需要 `service_role`，该密钥仍只属于受限导入执行器。每一个后台 Route Handler 都重新调用 `requireAuthor`，不能只相信 proxy 重定向；Client Component 不直接写 Supabase，也不使用 Server Action 绕过 HTTP seam。

### 自动导入

```text
本地 agent
  → POST /api/import (Bearer 导入密钥 + multipart Markdown/images)
  → ImportContent：限流、常量时间比较密钥、大小/数量/MIME/相对路径校验
  → MarkdownDocument：front matter schema、禁止 HTML/脚本、解析图片引用
  → ContentMedia：上传受管图片并替换为受管 asset 引用
  → ContentWorkspace：externalId 幂等写入草稿、pending 标签、事务提交
  → 201/200 { contentItemId, draftVariantId, created|updated, diagnostics }
```

契约要求 `externalId`、`kind`、`locale`、`title`、`summary`、`tags`；locale 首发只允许 `zh-CN`。图片只允许同一 multipart 包内的相对路径：拒绝绝对路径、`..`、远程 URL、重复路径、未引用附件及超出配额的文件。Markdown 允许标题、列表、链接、引用、表格、代码块、图片；原始 HTML 和脚本一律拒绝而非静默保留。`source_digest` 相同则返回幂等成功，不重复上传或写入。

失败在任何写入前返回 4xx；上传后的数据库失败走补偿删除。响应不回显原始 Markdown、私有图片 URL 或数据层错误。密钥轮换通过两个哈希环境变量的短暂重叠期完成，记录成功/失败审计事件但不记录密钥或正文。

### 公开读取与搜索

```text
/{locale}/blog/[slug] Server Component
  → ContentCatalog.getPublished({ kind: 'blog', locale, slug })
  → published variant + confirmed tags + signed public media URLs
  → MarkdownDocument.render → 404 或可访问的文章页/JSON-LD/metadata
```

搜索使用 `content_variants` 的 stored `tsvector` + GIN 索引，组合标题(A)、摘要(B)、正文(C)和 confirmed 标签(B)。Postgres `simple` configuration 不提供中文词语切分，因此它仅保存加权结构，不能作为中文检索实现；中文实际匹配使用 Supabase 提供的 `PGroonga` 索引，它支持中文等多语种全文检索。[PGroonga](https://supabase.com/docs/guides/database/extensions/pgroonga) 的 `pgroonga_score(tableoid, ctid)` 作为相关性排序，随后以发布时间与 id 稳定打破平局。`search_published_content(locale, query, kind, cursor)` 是唯一暴露给 `ContentCatalog.searchPublished` 的 SQL function：它固定 `state = 'published'`、过滤 kind、只索引已发布 variant 和 confirmed 标签，并限页。`scripts/verify-published-search.mjs` 使用“技术站”查询命中包含该词的中文博客，作为可复现运行时证据；初版 migration `20260720160055` 已于 2026-07-21 应用，随后由 corrective migration 修正为仅维护 published 搜索内容与 partial index。Supabase 推荐以生成 `tsvector`、GIN 索引及 RPC 承载多列高权重搜索。[Full text search](https://supabase.com/docs/guides/database/full-text-search)

## fixture 到真实数据的替换

先在 `lib/content/fixtures.ts` 提供与 `ContentCatalog` 返回类型完全一致的稳定已发布内容。公开页面仅依赖 catalog，不依赖 fixture；首个真实 migration 和种子数据完成后，将 composition root 从 `FixtureContentCatalog` 换成 `SupabaseContentCatalog`，页面和 e2e 的用户路径不变。fixture 永不进入生产数据读取路径，导入、后台、RLS 与搜索从第一张相关 ticket 起连接真实 Supabase。

## SEO、GEO 与渲染

`ContentCatalog` 返回 canonical path、标题、摘要、作者、发布日期、更新时间、来源和 locale，页面统一用它生成 metadata、canonical、Open Graph、`Article`/`Person`/`Project` JSON-LD。`app/sitemap.ts` 和 `app/rss.xml/route.ts` 只枚举已发布 variant。搜索页返回 `robots: { index: false, follow: true }`。Markdown renderer 输出语义化连续标题、可复制代码块、图片 alt 与外部来源链接；不渲染 HTML。

## 页面组件组织

- `page.tsx` 保留路由参数处理、数据读取、metadata 协作与页面组合；当页面主体过长或包含独立视觉区块时，拆到同一路由目录的页面级组件。
- 页面级组件默认私有于该路由，不因为“将来可能复用”提前放入全局目录。
- 导航、页脚、内容卡片、标签、Markdown 展示、表单字段等在至少两个页面共享且 interface 稳定后，提升为全局组件。
- 组件只接收渲染所需 DTO，不接收 Supabase client，也不自行获取领域数据；交互型 Client Component 通过对应 Route Handler 完成刷新或写入。
- 所有页面与组件样式使用 Tailwind CSS；条件 class 使用既有 `cn`，并以 `DESIGN.md` 的 token、间距、断点与动效规则表达。不得新增 CSS Modules、CSS-in-JS 或页面内联样式。`app/globals.css` 仅保留 Tailwind 入口、设计 token 与必要的全局基础规则。

## 首页 UI 原型结论

已于 2026-07-20 通过首页原型确认 **A — 编辑内容流**：首屏采用左侧定位与行动、右侧原创抽象 AI/工程插画；随后以最新博客主列表与主题/研究侧栏承接内容，再展示代表项目、精选项目和联系入口。该方向保留 `DESIGN.md` 的深色技术编辑风、低幅动效和响应式规则。

原型中的 B（工程信号面板）与 C（项目叙事）不进入生产实现。实现首页时重写 A 的原型代码为符合相应 ticket 的生产模块、真实数据读取与 e2e；不要将原型切换器或 fixture 带入生产。

## 测试策略

| 层级                 | 通过的 interface / 行为                                   | 关键证明                                                                                                |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 数据库 migration/RLS | 真实 Supabase SQL                                         | anon 只能读已发布；非作者不可写；作者仅处理自己内容；Storage 无匿名上传；导入执行器只有限定写入能力。   |
| 模块测试             | `MarkdownDocument`、`ContentWorkspace`、`ImportContent`   | front matter、状态转换、externalId 幂等、已发布不被覆盖、路径穿越/HTML/超量图片拒绝及补偿删除。         |
| Route 契约测试       | `/api/content`、`/api/search`、`/api/tags`、`/api/import` | Zod 拒绝非法输入；认证与状态码正确；有效导入建草稿、媒体重写、重复请求不重复、已发布目标生成草稿。      |
| 浏览器 e2e           | 公开路由和作者后台                                        | 列表、详情、标签、搜索、OAuth 拦截、草稿编辑/发布/撤回、pending 标签确认；不依赖 CSS class 或内部结构。 |
| 视觉/可访问性        | 四个目标宽度与 reduced motion                             | 320/768/1024/1440px，无横向滚动，键盘焦点、alt、对比度和动画偏好符合 `DESIGN.md`。                      |

每一张实现 ticket 至少运行 `pnpm verify`；有公开或后台行为时加相关 Playwright 场景；合入前运行 `pnpm build` 和已启动本地栈上的 `pnpm test:e2e`。测试数据通过 migration/seed 创建，不使用 service role 作为权限测试替身。

## 实现顺序

1. **数据与身份底座**：迁移、RLS、作者身份、受限 proxy matcher、内容类型与 seed。验证：数据库权限测试与未登录/非作者浏览器拦截。
2. **公开读取纵向切片**：`ContentCatalog`、fixture、locale 路由、博客列表与详情、Markdown 渲染、metadata/sitemap/RSS。验证：真实浏览器从首页到详情及 `noindex` 搜索元数据。
3. **作者工作区**：`ContentWorkspace`、草稿编辑、预览、发布/撤回与标签确认。验证：作者完整流程及旧公开内容切换。
4. **搜索与其余公开类型**：FTS RPC、项目、精选项目、首页聚合、响应式与可访问性。验证：筛选、排序、搜索只返回已发布内容。
5. **自动导入和媒体**：实现 `ImportContent`、`ContentMedia`、私有 bucket policy 与契约测试。验证：全部导入拒绝/幂等/已发布保护用例。

## 已确认的审阅结论

1. 仅受信任导入执行器可在服务端使用 `service_role`；agent 永不持有。
2. locale canonical URL 使用 `/{locale}/...`，未带 locale 的入口重定向。
3. `content_items + content_variants` 保留当前公开与当前草稿，不保留版本历史。

已确认后，将结论回写 `spec.md` 与 ADR 0001，并在 ticket 拆分获确认后生成基于本设计的 tickets；在此之前不开始业务实现。
