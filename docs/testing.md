# 测试与验证

## 本地栈

| 服务        | 命令       | 地址                    | 依赖          |
| ----------- | ---------- | ----------------------- | ------------- |
| Next.js Web | `pnpm dev` | `http://localhost:3000` | pnpm、Node 24 |

使用 `scripts/dev-local.sh up` 在 tmux 的 `lawson-site-dev` 会话中启动服务。它不创建 Supabase 或 Docker 服务。

## 检查

- `pnpm verify`：ESLint、TypeScript 与空白 diff 检查。
- `pnpm build`：生产构建。
- `pnpm test:e2e`：对已启动的本地栈运行 Playwright。测试不自行启动应用。

首次运行 e2e 请执行 `pnpm exec playwright install chromium`。测试录像、trace 和截图写入 gitignored 的 `evidence/` 与 `test-results/`。

## CI

GitHub Actions 会运行 lint、类型检查、生产构建，并启动构建产物后执行同一套 e2e smoke test。新增用户可见功能时，在 `e2e/` 中增加一个稳定的真实用户路径测试。
