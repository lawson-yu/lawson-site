# Issue tracker：本地 Markdown

本仓库的任务与规格（也可称为 PRD）以 Markdown 文件形式保存在 `.scratch/` 中。

## 约定

- 每个功能一个目录：`.scratch/<feature-slug>/`
- 规格文件：`.scratch/<feature-slug>/spec.md`
- 实现任务每项一个文件：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 编号；不要将多个任务合并为单一文件
- 在每个任务文件开头附近使用 `Status:` 行记录 triage 状态（角色名称见 `triage-labels.md`）
- 评论与讨论记录追加到文件底部的 `## 评论` 标题下

## 当技能要求“发布到 issue tracker”时

在 `.scratch/<feature-slug>/` 下新建文件，必要时创建目录。

## 当技能要求“获取相关任务”时

读取被引用路径中的 Markdown 文件。用户通常会直接给出路径或任务编号。

## Wayfinder 操作

供 `/wayfinder` 使用。一个工作地图文件对应多个任务文件。

- 地图：`.scratch/<effort>/map.md`，记录笔记、已作决定与待澄清事项
- 子任务：`.scratch/<effort>/issues/NN-<slug>.md`，从 `01` 编号；文件中使用 `Type:` 记录类型（`research`、`prototype`、`grilling`、`task`），使用 `Status:` 记录 `claimed` 或 `resolved`
- 依赖阻塞：在文件开头附近使用 `Blocked by: NN, NN`；所有被依赖任务均为 `resolved` 后，任务才解除阻塞
- 可执行队列：扫描 `.scratch/<effort>/issues/`，选择开放、未阻塞且未认领的最小编号任务
- 认领：先将 `Status:` 更新为 `claimed` 并保存，再开始工作
- 完成：在 `## 答案` 标题下追加结论，将 `Status:` 设为 `resolved`，再将上下文指针（gist 与链接）追加到 `map.md` 的“已作决定”部分
