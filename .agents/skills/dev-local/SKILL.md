---
name: dev-local
description: Start, stop, inspect, or attach to the Lawson Site local development stack.
---

# Local development stack

| 服务        | 启动命令   | 地址                    | 依赖          |
| ----------- | ---------- | ----------------------- | ------------- |
| Next.js Web | `pnpm dev` | `http://localhost:3000` | pnpm、Node 24 |

先运行 `pnpm install`，再使用：

- `scripts/dev-local.sh up`：在 tmux 启动服务；可安全重复运行。
- `scripts/dev-local.sh status`：显示窗口和 3000 端口状态。
- `scripts/dev-local.sh logs web`：查看最近日志。
- `scripts/dev-local.sh restart web`、`down`、`attach`：管理会话。

端口被占用时先运行 `scripts/dev-local.sh status`，再停止占用 3000 的进程或使用现有会话。窗口退出时运行 `restart web`。当前 Supabase 为托管服务，不需要 Docker 或本地基础设施。
