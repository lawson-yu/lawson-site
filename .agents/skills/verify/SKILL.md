---
name: verify
description: 在开 PR 前独立验收 Lawson Site 的功能，并运行回归检查与保留证据。
---

# /verify

在有提交的非默认分支上运行。默认模式为本机单栈；并行任务需要隔离环境时再引入 crabbox。

## 前置条件

- 启动应用：`scripts/dev-local.sh up`。
- 应用地址：`http://localhost:3000`。
- 浏览器驱动：`pnpm exec playwright`（首次使用执行 `pnpm exec playwright install chromium`）。
- 当前公开首页不需要认证；新增登录功能时，先补充一个真实登录 e2e，再为其他测试加入复用 session helper。
- 证据放在 gitignored 的 `evidence/`；CI 会上传 `test-results/` 和服务日志作为 14 天保留的 workflow artifact。

## 验证回路

1. 将任务的可观察验收条件交给一个未参与实现的只读 verifier；它通过运行中的真实应用操作页面，不得改代码。
2. verifier 将截图和短视频写入 `evidence/`，并仅报告预期、实际观察、结论和证据路径。
3. 若失败，修复后换一个新的 verifier 重新执行；最多三轮，再向人类升级。
4. 通过后运行 `pnpm verify && pnpm build && pnpm test:e2e`。e2e 不会自行启动应用。
5. PR 描述中嵌入成功截图，链接视频；失败时附 GitHub Actions 的 `playwright-artifacts` artifact。不要在功能未被独立验收前开 PR。

## e2e 约定

- 使用 role、label、文本或小型 `data-testid`，不用脆弱的 CSS 路径。
- 每个新增用户可见功能都增加一个确定性的真实路径测试到 `e2e/`。
- 不要删除或放宽断言来让测试变绿；先判断是产品 bug、过时测试还是环境问题。
