# 01 — 设计基础与公开导航

**What to build:** 访客在所有公开页面看到统一的浅色设计基础，并能在桌面与小屏通过清晰、可访问的导航进入现有内容页面；不改变任何导航目的地、内容数据或权限。

**Blocked by:** None — can start immediately.

**Status:** resolved

- [ ] 应用浅冰蓝 canvas、深色 inverse surface、细边界、系统字体 fallback、重复间距/圆角和可见 keyboard focus；不引入新 UI 框架、状态库、阴影卡片或替代动效。
- [ ] 公开导航在 desktop 保持现有链接，在 `<=991px` 由具备可访问名称、`aria-expanded` 与 `aria-controls` 的 hamburger 打开；键盘可操作且所有既有链接可达。
- [ ] 静态检查通过；浏览器在 desktop 与 mobile viewport 验证公开 shell 无横向滚动、菜单可用且焦点可见。
