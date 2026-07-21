# 01 — 上线静态河流首屏

**What to build:** 访客打开 LAWSON 首页时，可看到深色河流背景、柔软 3D 原创人物、前景浅色河流和极简品牌短句；公开导航与首页以下真实内容保持可访问。

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] 首屏仅覆盖导航下的首屏区域，显示深色河流背景、无边框人物与前景浅色河流；原有静态几何插画、说明和两个 CTA 不再显示。
- [x] 人物符合已确认的柔软 3D 漫画玩偶美术规范，且使用原创、可追溯的素材。
- [x] 桌面端人物在右侧，窄视口人物居中；现有公开导航、最新内容、代表项目、精选项目和联系入口仍可访问。
- [x] 静态验证与公开首页现有行为回归通过。

## 答案

- 已生成并接入原创深色河流背景与原创柔软 3D 人物素材；人物 PNG 经色键移除后确认具有有效 alpha 通道，原始导出与提示词记录在 `assets/`。
- 桌面与 390px Chromium 截图分别确认人物右侧与居中构图。
- 验证：`pnpm verify`；`pnpm exec playwright test e2e/public-experience.spec.ts --grep '无 locale 入口'`。
