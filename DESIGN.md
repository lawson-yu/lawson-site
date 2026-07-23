---
spec_version: 1
mode: update
sources:
  - path: index.html
    kind: source
  - path: collections.html
    kind: source
  - path: detail.html
    kind: source
  - path: todo.html
    kind: implementation-surface
  - path: styles.css
    kind: source-and-runtime
  - path: assets/aeonikmono-regular.otf
    kind: local-font
  - path: assets/twklausanne-300.otf
    kind: local-font
breakpoints:
  mobile: { max: 767px }
  compact: { min: 768px, max: 991px }
  desktop: { min: 992px }
tokens:
  color:
    primitive:
      ink: { $type: color, $value: "#030710" }
      ice: { $type: color, $value: "#f2faff" }
      pale: { $type: color, $value: "#e5f4ff" }
      blue: { $type: color, $value: "#7fc8ff" }
      navy: { $type: color, $value: "#161f34" }
      slate: { $type: color, $value: "#40668d" }
      footer-line: { $type: color, $value: "#29425d" }
    semantic:
      canvas: { $type: color, $value: "#f2faff" }
      canvas-catalogue-flank:
        { $type: color, $value: "#f7f6ff", exception: true }
      surface-soft: { $type: color, $value: "#e5f4ff" }
      surface-inverse: { $type: color, $value: "#030710" }
      text-primary: { $type: color, $value: "#030710" }
      text-muted: { $type: color, $value: "#40668d" }
      text-inverse: { $type: color, $value: "#cce9ff" }
      border-soft: { $type: color, $value: "#cce9ff" }
      border-control: { $type: color, $value: "rgb(3 7 16 / 16%)" }
      action-primary: { $type: color, $value: "#7fc8ff" }
      action-selected: { $type: color, $value: "#161f34" }
      focus-browser-default:
        { $type: color, $value: "rgb(0 95 204)", exception: true }
  font:
    mono:
      {
        $type: fontFamily,
        $value: '"Aeonik Mono Local", "Aeonik Mono", monospace',
      }
    display:
      {
        $type: fontFamily,
        $value: '"TWK Lausanne Local", "TWK Lausanne", sans-serif',
      }
  space:
    4: { $type: dimension, $value: 4px }
    8: { $type: dimension, $value: 8px }
    10: { $type: dimension, $value: 10px }
    12: { $type: dimension, $value: 12px }
    14: { $type: dimension, $value: 14px }
    16: { $type: dimension, $value: 16px }
    24: { $type: dimension, $value: 24px }
    32: { $type: dimension, $value: 32px }
    40: { $type: dimension, $value: 40px }
    48: { $type: dimension, $value: 48px }
    64: { $type: dimension, $value: 64px }
  radius:
    control: { $type: dimension, $value: 6px }
    tag: { $type: dimension, $value: 6px }
    card-media-desktop: { $type: dimension, $value: 12px }
    card-media-mobile: { $type: dimension, $value: 8px }
    media-featured: { $type: dimension, $value: 5px, exception: true }
  elevation:
    base: { $type: shadow, $value: none }
    video-glow:
      {
        $type: shadow,
        $value: "0 22px 70px rgba(127, 200, 255, 0.45)",
        exception: true,
      }
components:
  header:
    backgroundColor: "#f2faff"
    textColor: "#030710"
    typography: '"Aeonik Mono Local", "Aeonik Mono", monospace'
    rounded: 6px
  button:
    backgroundColor: "#7fc8ff"
    textColor: "#030710"
    typography: '"Aeonik Mono Local", "Aeonik Mono", monospace'
    rounded: 6px
  courseCard:
    textColor: "#030710"
    typography: '"TWK Lausanne Local", "TWK Lausanne", sans-serif'
    rounded: 12px
  filter:
    backgroundColor: "#e5f4ff"
    textColor: "#40668d"
    typography: '"Aeonik Mono Local", "Aeonik Mono", monospace'
    rounded: 6px
  pagination:
    backgroundColor: "#e5f4ff"
    textColor: "#40668d"
    typography: '"Aeonik Mono Local", "Aeonik Mono", monospace'
    rounded: 6px
  footer:
    backgroundColor: "#030710"
    textColor: "#cce9ff"
    typography: '"Aeonik Mono Local", "Aeonik Mono", monospace'
---

# Design System

## Overview

这是 LangChain Academy 的课程营销站与一篇长文详情页：浅冰蓝阅读画布、深蓝黑反向内容带、等宽 UI 文本与轻字重 display 标题并置。信息密度在首页为中等（大标题、三列课程、宽区块），目录页为高密度三列目录，详情页为低密度长阅读。

- `index.html`：引导学习并把用户导向课程分类、精选课程和销售 CTA。
- `collections.html`：按分类或关键词发现课程；筛选与搜索即时过滤，不请求后端。
- `detail.html`：阅读合作文章；目录、分享、正文、相关推荐和 newsletter 构成编辑型阅读 surface。

全局 shell 是顶部导航、浅色主画布、深色 footer。`collections.html` 的导航不是 fixed；`index.html` 与 `detail.html` 的 `.navbar2_component` 为 fixed，桌面内容须留出其视觉占位。不要把浅色页面做成白色，也不要把目录卡片包成白底卡片：此系统主要用留白、图像、文字和细边界分层。

## Foundations

### Color

颜色按 primitive、semantic、component 三层使用，YAML 是机器可读值。

- `ink #030710`：浅色 canvas 的正文、主要标题、桌面目录标题、深色 footer 背景。`collections` 桌面 card 标题/正文也为此色；移动端该 card 例外地用 `#52616d`/`#84929d`，不可抹平。
- `ice #f2faff`：全局 canvas、导航底色、selected filter 的文字；`pale #e5f4ff`：tag、非选中 filter、浅色 CTA、深色区中的浅按钮。
- `blue #7fc8ff`：Register、深色区标题与品牌、装饰点。它不是普通正文色；浅底正文不得用它承担长文本。
- `navy #161f34`：selected filter/page 背景及文字反白，表达选择状态；不是全局深色 surface。
- `slate #40668d`：正文弱化、CTA 说明、博客 byline。`#f7f6ff` 只用于 desktop catalogue 两侧的线性渐变，属低频 exception。
- 边界：导航为 `#e5f4ff`，tag/filter/pagination 为 `#cce9ff`，outline 控件为 `rgb(3 7 16 / 16%)`；深色 footer 用 `#29425d` 分栏。

真实 action 状态：Register 只有 normal 背景 `blue`；filter/page selected 使用 `navy` 背景、`ice` 文字；course card hover 标题改 `ink`，箭头平移 `(2px,-2px)`。源码未定义 disabled。浏览器实际键盘 focus 是 `rgb(0,95,204) auto 1px`、`outline-offset:1px`，并非设计的自定义 ring；复刻不得声称已有自定义 focus token。

### Typography

本地字体事实：`assets/aeonikmono-regular.otf` 以 `Aeonik Mono`/`Aeonik Mono Local` 声明，400；`assets/twklausanne-300.otf` 以 `TWK Lausanne`/`TWK Lausanne Local` 声明，300，后者也映射 250。没有本地 Helvetica 文件；logo 的 `Helvetica Neue` 为系统 fallback。浏览器 desktop 确认 collections 使用两份 Local font。

| Role             | 真实样式与使用位置                                                            | mobile                        |
| ---------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| UI/label/body    | `mono`，400；导航、按钮、filter/search 14px；footer 10–14px                   | 14px controls，导航 link 16px |
| Display masthead | `display`，300；collections wordmark 72px/72px/-4.6px                         | 36px/36px/-2.8px              |
| Page title       | `display`，250；collections `h1` 56px/61.6px/-1.68px                          | 32px/35.2px                   |
| Course title     | `display`，250；desktop 24px/28.8px/-0.72px                                   | 24px/28.8px                   |
| Course excerpt   | `display`，300；desktop 18px/27px, opacity .8                                 | 16px/24px，颜色变弱           |
| Blog title       | `display`，300；desktop computed 43.2px/44.496px/-2px，`clamp(40px,3vw,58px)` | 27px，左对齐                  |
| Blog prose       | `display`，400 implied by available face；24px/37.44px                        | 12px/18.24px                  |

标题靠低字重、负 letter-spacing 形成紧凑大字；不要用粗黑 display 替代。可读正文宽度来自布局：desktop blog 主栏 936px（虽偏宽），内容内由段落密度而非 max-width 控制。长标题必须允许换行：`detail` desktop 的 `white-space: nowrap` 是现有实现事实，但窄屏已覆写 `normal`；新 surface 不得复制此 desktop 风险。

### Spacing and Layout

重复 scale 为 4、8、10、12、14、16、24、32、40、48、64px。页面级 desktop 宽度：导航 max 1456px；academy/collections 内容 `.collections-width` 为 `min(1416px,94%)`，实际 1440px viewport 下 collections content 1312px（含两侧 16px 内缩）。移动 catalogue 主宽 `calc(100% - 32px)`，即 390px 下 358px。

- Desktop catalogue：hero wordmark padding `45px 0 81px`；content `72px 0 48px`；标题后 32px；toolbar 后 64px；grid `3` 列、40px column / 64px row gap；图片固定 220px 高。
- Mobile catalogue：content `28px 0 78px`；标题后 14px；toolbar vertical、30px gap、后 42px；单列、40px gap；图片按 1.78 ratio（358×201px）。
- Homepage：desktop hero 双栏，mobile 用 `column-reverse`，因此视频在 copy 前；课程 grid 3 列降 1 列。
- Detail：desktop `390px 936px` sidebar/content、66px gap；mobile 变 block，TOC 隐藏，related grid 变横向可滚动列。

### Radius, Border, Elevation, Opacity

control/tag/pagination 用 6px；course media desktop 12px、mobile 8px；博客封面/related card 4–5px。正文、section、页面 canvas、导航 mobile 底边均不圆角。除首页 video 的局部蓝色 glow 外，真实层级只用 1px border 和背景色；目录 card 没 shadow，footer/文章 related card 也不用 shadow。

透明度仅作弱化：desktop catalogue excerpt `opacity:.8`，blog byline 日期 `.72`，footer link `.55`。重要选择状态同时改变背景、文字和 `is-active` class；不得只降低 opacity 表达 selected、error 或 disabled。源码不存在 disabled 样式或 overlay。

### Motion

未发现 CSS `transition`、`animation` 或 `@media (prefers-reduced-motion)`；computed `transition: all` 来自浏览器默认而非显式设计规则。唯一确认的视觉状态变化是 hover 立即改变 course 标题色及箭头 `transform: translate(2px,-2px)`。复刻不应新增缓动；若后来加入 motion，`prefers-reduced-motion: reduce` MUST 取消非必要 transform/transition。

### Tailwind CSS

项目未使用 Tailwind CSS。没有 `tailwind.config.*`、utility class 组合或 Tailwind build 证据；复刻使用当前原生 HTML/CSS/JS 技术栈。

## Components

### Header

Purpose：提供品牌返回、全局导航和认证入口。Anatomy：logo link、primary nav links、Sign In/Register、menu toggle。Variants：`navbar2_*`（首页/详情、fixed）与 `collections-*`（目录、relative）。Sizes：desktop 62px inner nav；mobile collections 60px inner nav。Tokens：`canvas`、`border-soft`、`radius.control`、`mono`。

States/Interaction：992px 以下隐藏 link/actions，显示 48–50px hamburger；点击切换 `.is-open` 和 `aria-expanded`。390px collections 菜单展开为 `x:-10,y:62,w:390,h:782`，全视口高。Accessibility：logo 有可读 `aria-label`，toggle 有 `aria-controls`/`aria-expanded`；桌面菜单用 `nav` label。Allowed contexts：三页 shell。Forbidden：不要把 collections nav 设为 fixed，不要添加未存在的下拉菜单或登录 modal。

### Button

Purpose：导航认证和 CTA。Anatomy：单行文字 anchor/button。Variants：outline secondary（透明，`border-control`）；filled primary/Register（`action-primary`）；深色区 secondary（浅边界+反白）。Sizes：nav desktop minimum 48px、padding `12px 24px`；blog CTA 38px、`10px 16px`。Tokens：`mono` 14px/1（blog 10px），radius 6px。

真实 States：normal 与 menu 内满宽；无 disabled/loader；无 CSS hover/focus rule。Accessibility：保留真实 `<a>` 用于导航、`button` 用于动作；键盘 focus 依赖浏览器 outline，实施新样式时 MUST 用可见 `:focus-visible` 替代且不得移除。Forbidden：不要把所有按钮变 pill，不要将主色用于正文链接。

### Filter and Search

Purpose：collections 内即时筛选。Anatomy：`role=group` 内四个 filter button；带 screen-reader label 的 search input。Desktop：filter 42px、`12px 16px`、14px；search 360×46px、`0 18px`。Mobile：filter 40px、search 358×44px，toolbar stack。Variants：default 为 `surface-soft`+`border-soft`+`#4b7191`；selected 为 `navy`+`ice`。

Interaction：点击 filter 更新 `.is-active` 并按 `data-category` 隐藏 cards；输入 `zzzz` 时 0 cards 且真实 `No courses match this search.` 显示。search focus 将 border 改 `blue`。Accessibility：`aria-live="polite"` 在 grid；input 有 `type=search` 和可访问名称。Forbidden：不得加入 filter disabled、排序、远程 loading 或空态插画，均无证据。

### CourseCard

Purpose：在首页精选和目录中打开课程。Anatomy：整张 `<a>`、16:9-ish media、`Course` tag、`h2`、三行 clamp excerpt、箭头。Desktop catalogue：三列 411px card，220px media、12px media radius、copy `24px 16px 0`；mobile 单列，201px media、8px radius、copy `20px 14/16px 0`。Tokens：`display`、`surface-soft` tag、`border-soft`、card radius。

States：hover 仅 collections：`h2` to `ink`，arrow `(2px,-2px)`；没有 selected/disabled。Accessibility：非装饰课程图有具体 alt；整卡保持单一 link target。Allowed：course category、featured、catalogue。Forbidden：不要给 card 加白底、shadow、独立按钮或 hover scaling。

### Pagination and Footer

Pagination Purpose：目录页码展示。36×36px desktop/mobile、6px radius、default pale/soft border/slate，current navy/white，`aria-current="page"`。现有 pagination 没有 click 行为与 disabled prev/next；不得伪称可翻页。

Footer Purpose：全站收口和链接。深色 `surface-inverse`，三栏链接 desktop、单列 mobile；首页/详情还含 community/CTA。large footer logo 在 mobile 隐藏。Allowed：global footer。Forbidden：不要给 footer 加卡片阴影或把链接变高对比白色；当前 muted link 低对比是事实，复刻若改善必须作为 Design Spec Gap 报告，不可暗改。

复刻验收回写：Footer 的视觉契约还必须包含三栏完整信息密度（Products 8 links、Resources 9 links、Company 5 links）、每栏 `padding-top:25px`/top border，desktop `footer-logo` 为满内容宽且位于 links 后、legal 前（margin `62px 0 43px`）；mobile 隐藏该 logo，legal 改为纵向并带 top border。品牌 mark 的四瓣几何是 HTML/CSS 结构，不是通用字符图标；复刻 MUST 使用同等的四瓣 mark，不得用 Unicode 替换。

## Reference Implementation

以下为契约参考，不是新组件库或额外功能；技术栈保持原生 HTML/CSS。

```html
<button class="is-active filter" data-filter="all">All Courses</button>
<input
  class="course-search__input"
  type="search"
  aria-label="Search courses"
  placeholder="Search"
/>
```

```css
.filter {
  min-height: 42px;
  padding: 12px 16px;
  border: 1px solid #cce9ff;
  border-radius: 6px;
  background: #e5f4ff;
  color: #4b7191;
  font:
    14px/1 "Aeonik Mono Local",
    "Aeonik Mono",
    monospace;
}
.filter.is-active {
  border-color: #161f34;
  background: #161f34;
  color: #f2faff;
}
.course-search__input:focus {
  border-color: #7fc8ff;
}
@media (max-width: 767px) {
  .filter {
    min-height: 40px;
    padding: 10px 16px;
  }
}
```

```html
<a class="course-card" href="/course/example">
  <img src="…" alt="Example course preview" />
  <div class="course-card__copy">
    <span>Course</span>
    <h2>Course title</h2>
    <p>Excerpt</p>
    <b>↗</b>
  </div>
</a>
```

```css
.course-card > img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
}
.course-card h2 {
  font:
    250 24px/1.2 "TWK Lausanne Local",
    "TWK Lausanne",
    sans-serif;
  letter-spacing: -0.72px;
}
.course-card:hover b {
  transform: translate(2px, -2px);
}
@media (max-width: 767px) {
  .course-card > img {
    height: auto;
    aspect-ratio: 1.78;
    border-radius: 8px;
  }
}
```

## Surface Recipes

### Home

固定 header 后是 Academy masthead、左右 hero（copy/video）、Course Categories 三列、Featured Courses 三列、淡色 CTA、深色 community/footer。mobile：header menu 覆盖 viewport；masthead 缩小；hero video 先于 copy；所有 grid 单列；footer columns 堆叠并隐藏大 logo。

### Catalogue

relative header、Academy wordmark hero、浅色内容区。desktop catalogue 只有 content 区使用 `#f7f6ff → ice → #f7f6ff` flank gradient；标题上方无面包屑。toolbar 让 filters 左、search 右；三列课程；footer 紧接分页。mobile 去掉 flank gradient，filters 自然换行，search 占满一行，单列 cards。

### Article Detail

fixed header 后为带点状 horizontal rule 的居中 hero、category chip、byline；desktop 正文为 sidebar + content，后接深色 related/newsletter/CTA。mobile hero 左对齐，隐藏 TOC 但保留 back/share，正文小字号，related cards 横向滚动，CTA buttons 纵向全宽。

### Todo

relative Header 后为浅色 hero（kicker、`h1`、简短说明），再进入双栏任务 workspace：左侧任务输入、状态 filter、任务列表；右侧为低密度 working-rule aside。主区和 hero MUST 始终使用 `canvas #f2faff`；`canvas-catalogue-flank #f7f6ff` gradient 是 Catalogue 专属 exception，Todo MUST NOT 使用。desktop 左右栏为 `minmax(0,1fr) 360px`，mobile 堆叠为单栏，输入与 Add task button 纵排。任务状态用 checkbox、删除按钮、可见文字和 count 表示，不能只依赖颜色。持久化仅限当前浏览器 `localStorage`；不新增后端、排序、日期或 disabled state。

## Responsive Rules

Breakpoint 是 max-width 991px 的导航切换与 blog/Todo layout collapse，max-width 767px 的 mobile spacing/grid/type；collections desktop refinements 在 min-width 992px。不得把 390px 值外推为所有 mobile 的固定宽度。可缩放的 container 用 `calc(100% - 32px/48px)`，内容不应产生横向滚动；detail related carousel 是唯一允许的 horizontal overflow。

## Accessibility

MUST 使用现有 landmark、heading 顺序、语义 `<nav>`/`<article>`/`<button>`/`<a>` 和 input label。MUST 保留 `aria-expanded`、`aria-controls`、`aria-live`、`aria-current` 与有意义的 image `alt`。键盘顺序须能到达 logo、nav、filters/search、course links、pagination；menu toggle 可用 Enter/Space。当前源码未写 `:focus-visible` 且运行态为 browser default；复刻时 MUST 至少保留同等可见 outline。长文本允许 card clamp，但正文不得截断；窄屏不得让 masthead/标题越界。无 reduced-motion source rule；新增动态时 SHOULD 支持 reduce。

## Do's and Don'ts

Do：用 `mono` 处理 controls 和 metadata；用轻 `display` 处理标题；让浅/深 color block 承担分区；按真实 breakpoint 堆叠。

Don't：不新增 Tailwind、Zustand、modal、shadow card、disabled state、动画或自定义 font；不把 selected 仅表示为低 opacity；不把 desktop catalogue flank gradient 放进首页或详情。

## Agent Implementation Protocol

MUST 优先遵从 YAML token 和本文件的组件/recipe；MUST 使用已存在的本地 font 文件及原生栈；MUST 复刻真实 interaction/ARIA；MUST 在 desktop 1440×900、mobile 390×844 验证。

SHOULD 使用重复 token，保留 source page 的例外；SHOULD 将 CSS 后置覆盖冲突以运行态 computed CSS 解决。MAY 提取小型共享 CSS class，但不得改变 DOM 语义或新增视觉体系。

Design Spec Gap：遇到未记录 component、状态、breakpoint、字体 weight、图片加载失败或对比度改进时，agent MUST 报告 selector、viewport、证据、候选方案和影响；未获确认不得猜测为事实或全局 token。

## Evidence and Assumptions

| Item                              | Status                   | Source                                                          | Confidence | What would change it                                             |
| --------------------------------- | ------------------------ | --------------------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| fonts/weights                     | confirmed                | `styles.css` `@font-face` + 1440 runtime `document.fonts`       | high       | 新字体文件或不同 computed family                                 |
| desktop catalogue geometry        | confirmed                | 1440×900 runtime `.collections-*` computed CSS                  | high       | 改 breakpoint/后置 CSS                                           |
| mobile catalogue geometry         | confirmed                | 390×844 runtime computed CSS                                    | high       | 改 mobile media query                                            |
| filter/search empty behavior      | confirmed                | `collections.html` JS + live interaction                        | high       | 改 updateCourses logic                                           |
| menu open behavior                | confirmed                | `collections.html` JS + 390×844 live click                      | high       | 改 class/ARIA handler                                            |
| card hover                        | confirmed                | `styles.css` + live hover                                       | high       | 新 hover declaration                                             |
| custom focus ring                 | inferred: false; absent  | CSS search + keyboard runtime                                   | high       | 添加 explicit focus-visible CSS                                  |
| disabled state                    | inferred: false; absent  | HTML/CSS/runtime                                                | high       | 新 disabled control evidence                                     |
| reduced motion                    | inferred: false; absent  | CSS search                                                      | high       | `prefers-reduced-motion` rule                                    |
| blog body effective weight        | inferred                 | local file only 300 but CSS requests normal/strong              | medium     | supplied 400/700 font asset or font inspection proving variation |
| external image/video final pixels | inferred                 | remote CDN/YouTube may vary/load fail                           | medium     | self-hosted assets or captured network-stable fixture            |
| replica footer density/brand mark | gap found then specified | 1440×900 original-vs-temporary replica screenshot comparison    | high       | a second replica with full links, large logo and four-part mark  |
| Todo canvas rule                  | confirmed                | `todo.html` implementation + desktop/mobile computed background | high       | an approved Todo-specific surface redesign                       |

Evidence capture used localhost sources plus Playwright CLI screenshots and DOM/computed CSS at 1440×900 and 390×844. Screenshots were temporary evidence, not a permanent repository artifact.
