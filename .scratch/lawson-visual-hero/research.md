# 互动彩虹 + 角色首页视觉：实现与物料调研

日期：2026-07-21
范围：根据录屏中的「彩虹参数化动效 + 居中动漫风角色 + 深色山景背景」评估实现方式、所需物料与取得路径；本文件不授权开始实现。

## 结论

第一版应采用 **Canvas 2D 彩虹 + CSS/SVG 山景 + 一张透明背景的原创静态角色图**。它能覆盖录屏的主要视觉效果，首屏资源、开发和版权风险都最低。人物仅做呼吸式漂浮、轻微位移或随鼠标倾斜；不要把整页做成视频，也不要一开始引入 Three.js 或 Live2D。

只有在需求明确为「角色可被拖拽旋转、切换镜头或播放骨骼动作」时采用 3D；只有在需求明确为「眨眼、口型、头部转向、表情切换」时采用 Live2D。后两者都额外需要角色生产管线与许可核验。

## 画面拆解与推荐实现

| 画面层       | 推荐方式                       | 原因与关键点                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 彩虹短线     | `canvas` 2D                    | 每个短线按极坐标计算角度和半径，再旋转后画圆角矩形；参数面板只更新目标值，动画循环按时间差插值到当前值。`requestAnimationFrame` 在下一次重绘前回调，且需使用其时间戳计算进度，才能避免高刷新率屏幕加速。[MDN：requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) [MDN：roundRect](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect) |
| 山、雾、光晕 | CSS 渐变 + 2–4 层 SVG/CSS 形状 | 低成本实现层次和缓慢视差；只移动 `transform`/`opacity`，不必做复杂逐帧动画。若形状少且后续由设计师维护，可直接使用 SVG；SVG 的动画元素能改数值、变换和颜色。[MDN：SVG 动画](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_animation_with_SMIL)                                                                                                                                                              |
| 角色（MVP）  | 透明 PNG 或 WebP + CSS         | 静态角色配合浮动、缩放和轻微倾斜即可形成“活着”的感觉；图像应以展示尺寸的 2 倍导出，保留透明通道。                                                                                                                                                                                                                                                                                                                         |
| 控制面板     | React 客户端组件               | Slider/Toggle 改变彩虹的颜色、行数、间距、圆角等目标参数；移动端可以隐藏为预设切换，避免占用首屏。                                                                                                                                                                                                                                                                                                                        |
| 无障碍与降级 | `prefers-reduced-motion`       | 为减少动态效果的用户固定到静态首帧并停止循环；这是浏览器提供的媒体特性。[MDN：prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)                                                                                                                                                                                                                |

彩虹应是一个独立客户端组件：它拥有画布尺寸、动画循环和配置对象；页面仅负责布局、文案和传入初始预设。角色、背景和控制面板不要耦合到绘制循环。这样后续替换角色素材或关闭动效都不会影响首页其他内容。

## 三种角色路径

### A. 静态角色图（推荐）

适合录屏所示的装饰性首页角色。所需物料：

- `character.webp` 或 `character.png`：透明背景、全身或半身，建议 2 倍展示尺寸；
- 可选 2–3 个状态图：普通、眨眼、挥手。没有也可以；
- 源文件：PSD/AI 或分层导出文件，便于修色、裁切和响应式构图；
- 角色版权/商用授权证明。

获得方式按稳妥程度排序：

1. 委托插画师原创并签约。合同应写明：网页商业发布、裁切/改色/压缩等衍生修改权、地域与期限、独占或非独占、第三方素材清单、署名要求，以及源文件交付。
2. 使用自行创作或公司自有的角色设定；同样保留源文件与授权链路。
3. 使用 AI 生成作为草图或最终静态图后人工修图。不得要求仿制具体动漫 IP、角色或工作室风格；涉及真人参考时须取得肖像同意。ChatGPT Images 支持生成与编辑图像；其官方实践建议避免品牌/作品模仿并取得肖像许可。[OpenAI：图像库与编辑](https://help.openai.com/en/articles/11084440-chatgpt-image-library) [OpenAI：Image generation academy](https://openai.com/academy/image-generation/)

### B. Live2D

只在角色需要自然眨眼、口型、呼吸、头部角度和表情切换时选择。Cubism SDK for Web 是在 Web 中以程序使用 Cubism 模型的开发套件；模型由 Editor 生产，SDK 负责运行时呈现。[Live2D：Cubism SDK for Web](https://docs.live2d.com/en/cubism-sdk-manual/cubism-sdk-for-web/) [Live2D：SDK 介绍与发布许可](https://www.live2d.com/en/sdk/about/)

除角色授权外，需准备：

- **分层原画**：脸、前后发、眉、眼白/虹膜/眼睑、嘴内外、躯干、手臂等遮挡部分不能画死；
- **绑定交付**：`.cmo3` 工程、导出的 `.moc3`、纹理、`model3.json`、动作、表情、物理与姿势文件；
- **制作服务**：插画师与 Live2D 绑定师，或同一供应商；
- **许可留档**：Cubism Editor/SDK 当前许可及角色原画授权是两条独立链路，均须逐项确认。SDK 的发布要求会随产品/组织条件变化，应以当期条款为准。[Live2D：Web SDK 下载条款入口](https://www.live2d.com/en/sdk/download/web/)

### C. 真 3D

只在需要可旋转、可变镜头、骨骼动作或复杂灯光时选择。Web 端优先使用 `.glb`/glTF：Three.js 官方把 glTF 作为推荐运行时工作流；`GLTFLoader` 可加载场景与动画。[Three.js：Loading 3D Models](https://threejs.org/manual/en/loading-3d-models.html) [Three.js：GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)

所需物料：

- `.blend` 源文件；
- 已绑定骨骼、命名清晰的动作片段；
- PBR 纹理与可导出的 `.glb`；
- 角色模型商业授权与第三方纹理授权；
- 性能预算后的压缩版本。Blender 的 glTF 导出支持面向运行时的网格、材质、纹理、动画与骨骼；Draco 可压缩网格，但压缩越高，解码时间也会增加。[Blender：glTF 导出](https://docs.blender.org/manual/en/3.3/addons/import_export/scene_gltf2.html)

## 物料采购与许可规则

| 物料                         | 首选来源                                    | 可用替代                                                                      | 必须留档                                                                    |
| ---------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 角色                         | 定制插画/自有 IP                            | 经人工验收的原创 AI 图                                                        | 合同或生成记录、源文件、导出文件、授权范围                                  |
| 山景 SVG、渐变、彩虹         | 自行制作                                    | CC0 图形/纹理                                                                 | 源文件或资产页、许可证、下载日期                                            |
| HDRI、纹理、非角色 3D 环境物 | [Poly Haven](https://polyhaven.com/license) | [Kenney](https://kenney.nl/support)                                           | Poly Haven 与 Kenney 的相关资产为 CC0，可商业使用；仍保存资产页和许可证快照 |
| 3D 角色                      | 原创建模/委托                               | [Sketchfab Standard License](https://sketchfab.com/licenses) 的单个已核验模型 | 订单/发票、模型页、许可证版本、作者与下载日期                               |

不得把「可下载」「免版税」直接等同于可用于网站商业发布。以 Sketchfab 为例，**Editorial** 许可禁止商业和推广用途；Standard 许可也禁止把模型作为可被单独提取、下载或再授权的文件发布，并且可能仍需额外处理人物、商标或作品的权利。[Sketchfab License Agreement](https://sketchfab.com/licenses)

开源/免费素材仅选择 **CC0、CC BY 或明确的商业许可证**：CC BY 需要按其条件署名；CC BY-SA 会要求衍生作品以相同许可分享；NC 禁止商业用途，ND 禁止改编，因此不适合需要裁切、调色或二次制作的角色物料。[Creative Commons：许可证说明](https://creativecommons.org/share-your-work/cclicenses/) [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en)

建议为每一项外部资产建立 `assets/LICENSES.md`（实现阶段再创建），最少记录：文件名、作者、来源 URL、下载日期、许可证全称/版本、是否需要署名、订单或合同编号、修改说明。不要把未经授权的动漫角色、游戏角色或品牌吉祥物作为参考图直接上线。

## 建议执行顺序

1. 确认角色定位：仅装饰则走静态角色；需要表情或可互动才进入 Live2D/3D 预算与选型。
2. 先做无角色视觉原型：彩虹 Canvas、山景层、预设参数和动效降级；同时在桌面和手机上确认首屏构图与帧率。
3. 并行获得一张透明背景的原创角色图和可追溯授权；放入页面后再微调位置与色彩。
4. 以真实设备和 Lighthouse 复核加载与动画体验；仅当静态图无法满足明确交互目标时，再升级 Live2D 或 3D。

这个顺序把不可逆的采购和重型技术选择放在体验验证之后，避免为了一个装饰型首页过早引入长期维护成本。
