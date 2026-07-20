# 01 — 发布博客的公开阅读与最小内容底座

**What to build:** 访客可以通过首发 locale 的稳定 URL 浏览已发布博客列表与详情；站点从一开始就只向匿名访问者暴露已发布内容。

Blocked by: None — can start immediately.

Status: resolved

- [x] 内容 identity、locale、已发布 variant 与已确认标签具备最小数据模型、迁移和稳定 seed，匿名读取边界由 RLS 验证。
- [x] 访客可浏览博客列表、详情、标签和安全 Markdown 内容；详情具备基础 metadata、JSON-LD 与浏览器 e2e 证明。
- [x] 初始公开博客夹具不依赖受管图片；图片能力由后续媒体 ticket 交付。

## 评论

- 已完成公开博客列表、详情、确认标签筛选、安全 Markdown、metadata/JSON-LD、Supabase migration/RLS 与稳定 seed。
- 验证：`pnpm verify`、`pnpm build`、`pnpm test:rls`、`pnpm test:e2e`。
