# 06 — 已发布内容搜索与筛选

**What to build:** 访客可以按关键词和内容类型搜索全部已发布博客、个人项目和精选项目；搜索结果页不参与搜索引擎索引。

Blocked by: 01 — 发布博客的公开阅读与最小内容底座; 03 — 个人项目的管理与公开展示; 04 — 精选项目资料库的管理与公开展示.

Status: resolved

- [x] 搜索只返回已发布内容与已确认标签，可按内容类型筛选并稳定分页或排序。
- [x] migration 前完成中文全文搜索配置的分词验证，并将结果保留为搜索完成证据。
- [x] 搜索页的 noindex metadata、结果权限边界和浏览器路径通过自动化验证。

## 评论

- 使用 PGroonga 进行中文匹配，`search_document` 保留结构化权重与顺序辅助；纠正 migration 将索引收窄至已发布内容，并按相关性、发布时间和 ID 排序。
- 已将初版与纠正 migrations 应用到 linked Supabase 测试项目。
- 验证：中文/RLS 搜索脚本、浏览器搜索路径、`pnpm verify`、`pnpm build`、`git diff --check`；最终 Standards 与 Spec review 均无阻断项。
