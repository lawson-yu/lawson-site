---
schemaVersion: "1.0"
scope: "global"
status: "active"
product: "LAWSON"
themes: ["light"]
breakpoints:
  compact: "0-767px"
  medium: "768-1023px"
  expanded: "1024px+"
sources:
  - id: "user-approved-author-workspace"
    kind: "product-context"
    ref: "2026-07-28 confirmed UI decisions"
    confidence: "high"
  - id: "existing-tokens"
    kind: "existing-ui"
    ref: "app/globals.css"
    confidence: "high"
colors:
  canvas: "#f2faff"
  surface-default: "#e5f4ff"
  surface-raised: "#f2faff"
  text-primary: "#030710"
  text-secondary: "#475569"
  border-default: "#cce9ff"
  action-primary: "#2563eb"
  action-primary-hover: "#1d4ed8"
  focus-ring: "#005fcc"
  status-success: "#166534"
  status-danger: "#b91c1c"
typography:
  display:
    fontFamily: "SF Pro Display, Aptos Display, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: "800"
    lineHeight: "1.1"
    letterSpacing: "-0.025em"
  heading:
    fontFamily: "SF Pro Display, Aptos Display, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "1.25rem"
    fontWeight: "700"
    lineHeight: "1.25"
    letterSpacing: "-0.015em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "0.875rem"
    fontWeight: "700"
    lineHeight: "1.25"
    letterSpacing: "0.08em"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  6: "1.5rem"
  8: "2rem"
  12: "3rem"
radius:
  control: "0.375rem"
  container: "0.375rem"
  pill: "9999px"
elevation:
  base: "none"
  raised: "1px solid border"
  overlay: "0 18px 48px rgb(3 7 16 / 8%)"
motion:
  feedback: "150ms ease-out"
  enter: "200ms ease-out"
components:
  - "shadcn Button"
  - "shadcn Input"
  - "shadcn Textarea"
  - "shadcn Select"
  - "shadcn Table"
  - "shadcn Badge"
  - "shadcn Sheet"
  - "shadcn Tooltip"
  - "shadcn Separator"
---

# LAWSON Design Language

## 1. Scope and decision record

### Product context

LAWSON 是中文优先的个人内容站。公开页面负责阅读与发现；`/author/**` 是唯一作者管理博客、个人项目、精选项目的工作区。后台重构只改变视觉与导航，不改变路由权限、Supabase 读取、API、发布或撤回规则。

### Evidence and decisions

| Decision        | Status   | Source              | Confidence | What would change it           |
| --------------- | -------- | ------------------- | ---------- | ------------------------------ |
| 冰蓝浅色 token  | existing | `app/globals.css`   | high       | 用户批准的新品牌 token         |
| 后台固定左菜单  | approved | 2026-07-28 用户确认 | high       | 用户批准不同导航模型           |
| 分类独立路由    | approved | 2026-07-28 用户确认 | high       | 服务端导航限制                 |
| shadcn 按需引入 | approved | 2026-07-28 用户确认 | high       | 组件无法满足可访问性或体积要求 |

### Rule precedence

Accessibility 和平台约束高于已批准例外；已批准例外高于 surface recipe；surface recipe 高于 global foundation；示例不覆盖规则。

## 2. Visual grammar

- Mood：冷静、工具化。用浅蓝画布、细边界、清晰密度，避免营销页 hero 与大面积卡片。
- Density：公开阅读页偏疏；作者列表、表单偏紧凑。
- Surface treatment：默认平面，靠 `border-default` 分层；仅 Sheet 使用 overlay elevation。
- Signature moves：深色强标题、蓝色唯一主动作、状态文字加 Badge、表格标题可点击。
- Anti-patterns：不用 shadcn 默认灰紫主题；不用圆角胶囊导航；不用只靠颜色传达状态；不把手机 Table 改为卡片。

## 3. Foundation token rules

### Color

- `action-primary` 只用于每个工作区的一个新建动作和明确提交。
- `surface-default` 供侧栏、输入背景与辅助区；`surface-raised` 供主画布。
- success/danger 必须与文字和 Badge 同时出现。
- light-only。新主题必须先更新 frontmatter 与 `app/globals.css`。

### Typography

- Display 仅用于页面标题；正文和表单使用 body。
- 中文优先系统字体；数字使用同一字体。mono 只用于代码。

### Geometry and depth

- 4px 基础间距；后台主区 24px 到 32px 间距。
- control/container 使用 6px；Badge 可用 pill；导航项不用 pill。
- 不用常规卡片阴影；浮层才可用 overlay。

## 4. Layout and responsive behavior

- 最大内容宽度 1200px。扩展屏为 224px 左侧栏与 `minmax(0, 1fr)` 主区。
- compact 隐藏固定侧栏，用 Sheet；主区 gutter 16px。
- Table 窄屏保留表格语义：标题、状态、操作必显；摘要与次要元数据隐藏；外层可横向滚动。
- 可点击控件最小高度 44px。仅 opacity/transform 可做反馈动画；reduced motion 禁用进入动画。

## 5. Global component contracts

### Button

Purpose：触发新建、保存和生命周期动作。Variants：primary、secondary、ghost；尺寸最小 44px。默认、hover、active、focus-visible、disabled、loading 均需可见。primary 只用于一个当前主动作；icon-only 必须有 accessible name。

### Table

Purpose：浏览同一内容类别。含 caption、thead、tbody、标题链接、状态 Badge、操作列。支持 loading、empty、error、overflow；不支持列表内发布撤回。标题链接进入编辑，预览为次级操作。

### Sidebar and Sheet

Purpose：类别导航与辅助管理。桌面 Sidebar 固定；compact 用 Sheet。选中项需文字、左侧线与 `aria-current="page"`；Sheet 支持 Escape、焦点陷阱和关闭后还焦点。

### Input, Textarea and Select

Purpose：作者表单。含 label、辅助说明或 error。支持 default、focus-visible、filled、disabled、error；不靠 placeholder 作 label。

### Badge and Tooltip

Badge 表达草稿/已发布等文字状态，不单独承载信息。Tooltip 仅解释 icon-only 控件，不能藏关键动作。

## 6. Surface recipes

### Editorial public surfaces

- Primary task：阅读、发现内容。
- Shell and navigation：保留已有 public layout、导航和 footer。
- Compact transformation：按既有公开路由实现；不因后台重构改动。

### Author app and workflow surfaces

- Primary task：按类别浏览、创建、编辑与预览内容。
- Shell and navigation：所有 `/author/**` 使用同一 Author shell；菜单为博客、个人项目、精选项目，底部为待确认标签与退出登录。
- Information hierarchy and density：页面标题、简短说明、一个主新建 Button、主 Table；编辑页为表单主区和生命周期辅助区。
- Composition：列表使用 Table；表单用字段组与分隔线；预览保持阅读宽度。每页最多一个 primary CTA。
- Empty/loading/error：空列表给出对应新建入口；加载保留表格/表单结构；错误明确说明且给可恢复动作。
- Compact transformation：Sidebar 变 Sheet；表格按优先列隐藏；表单单列。
- Forbidden patterns：不展示三类内容混合列表；不在 Table 内放发布撤回；不改业务状态或数据模型。

## 7. Imagery, iconography and motion

- Imagery 仅为内容媒体，不作后台装饰。
- 使用 `lucide-react` 线性图标，16px 或 18px；icon-only 控件必须具名。
- feedback 使用 `150ms ease-out`；reduced motion 禁用非必要动画。

## 8. Accessibility and content resilience

- 目标 WCAG AA。
- 所有键盘控件有 `focus-visible`；选中、错误、成功、禁用都有非颜色线索。
- 长中文标题可换行，表格标题列 `min-width: 0`；200% 缩放不丢主操作。

## 9. Do's and Don'ts

### Do

- Do 复用 `app/globals.css` token：跨公开和后台保持品牌一致。
- Do 用分类路由和 `aria-current`：导航状态可直链且可读。
- Do 保留 Table：内容工作区优先扫描与定位。

### Don't

- Don't 套用 shadcn 默认 theme：会破坏冰蓝品牌基线。
- Don't 把后台操作做成卡片墙：降低扫描效率。
- Don't 修改公开 shell 或领域逻辑：超出后台 UI 范围。

## 10. Agent implementation protocol

- MUST 复用声明 token 和组件 id；不得新增原始颜色、间距、radius 或 shadow。
- MUST 保留 focus-visible、响应式和 reduced-motion。
- SHOULD 先匹配 Author app and workflow recipe。
- MAY 添加局部例外，必须记录上下文、原因和退出条件。
- MUST 遇到缺失决定时报告 `Design Spec Gap`，不得猜测。

### Completion checklist

- [ ] Tokens 和 component ids 可解析。
- [ ] Author surface recipe 和动作层级已遵守。
- [ ] 状态、键盘焦点和非颜色线索存在。
- [ ] compact 转换已实现。
- [ ] 没有公开 shell 或领域逻辑变更。

## 11. Assumptions and planned changes

| Item         | Current decision                                     | Status  | Evidence needed to confirm or change |
| ------------ | ---------------------------------------------------- | ------- | ------------------------------------ |
| shadcn base  | 使用 Radix base，组件源码归仓库所有                  | planned | 初始化产物与类型检查                 |
| 作者类别入口 | `/author/blog`、`/author/project`、`/author/curated` | planned | 路由实现与浏览器验收                 |
